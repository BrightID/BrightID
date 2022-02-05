import _ from 'lodash';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { InteractionManager } from 'react-native';
import { setApps, upsertSig, updateSig, selectAllSigs } from '@/reducer/appsSlice';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';
import { isVerified } from '@/utils/verifications';

const WISchnorrClient = require('@/utils/WISchnorrClient');

export const updateBlindSig =
  (app) => async (dispatch: dispatch, getState: GetState) => {
  const {
    user: { verifications, id },
    keypair: { secretKey },
    apps: { apps },
  } = getState();
  const sigs = selectAllSigs(getState());
  const verificationsByName = _.keyBy(verifications, (v) => v.name);
  const vel = app.verificationExpirationLength;
  const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;
  for (const verification of app.verifications) {
    const sigInfo = sigs.find(
      (sig) =>
        sig.app === app.id &&
        sig.verification === verification &&
        sig.roundedTimestamp === roundedTimestamp,
    );
    if (sigInfo && sigInfo.sig) {
      console.log(`sig exists for ${app.name} (${verification})`);
      // eslint-disable-next-line no-continue
      continue;
    }
    if (!isVerified(verificationsByName, verification)) {
      console.log(
        `user is not verified for ${app.name} (${verification})`,
      );
      // eslint-disable-next-line no-continue
      continue;
    }

    try {
      const network = __DEV__ ? 'test' : 'node';
      // noinspection HttpUrlsUsage
      // TODO: Don't fallback to node.brightid.org. 'app.nodeUrl' should be mandatory.
      const url = app.nodeUrl || `http://${network}.brightid.org`;
      const api = new NodeApi({ url, id, secretKey });
      const info = stringify({
        app: app.id,
        roundedTimestamp,
        verification,
      });
      console.log(info, 'info');
      const { wISchnorrPublic } = await api.getState();
      if (!wISchnorrPublic) {
        console.log('wISchnorrPublic is not set');
        // eslint-disable-next-line no-continue
        continue;
      }
      const client = new WISchnorrClient(wISchnorrPublic);
      let pub, uid, challenge;
      if (!sigInfo) {
        pub = await api.getPublic(
          app.id,
          roundedTimestamp,
          verification,
        );
        uid = CryptoJS.enc.Base64.stringify(
          CryptoJS.lib.WordArray.random(16),
        );
        console.log(
          `using ${uid} for ${app.name} (${verification}) as uid`,
        );
        challenge = client.GenerateWISchnorrClientChallenge(
          pub,
          info,
          uid,
        );
        console.log(challenge, 'challenge');
        // store sig info before getting sig to be able to receive sig from server again
        // if app stopped just after querying the one time sig from the server
        await dispatch(
          upsertSig({
            uid,
            app: app.id,
            roundedTimestamp,
            verification,
            pub,
            challenge,
            linked: false,
            linkedTimestamp: 0,
            signedTimestamp: Date.now(),
          }),
        );
      } else if (sigInfo && !sigInfo.sig) {
        pub = sigInfo.pub;
        uid = sigInfo.uid;
        challenge = sigInfo.challenge;
      }

      const s = stringify({ id, public: pub });
      const sig = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(s), secretKey),
      );

      const response = await api.getBlindedSig(
        stringify(pub),
        sig,
        challenge.e,
      );
      console.log(response, 'response');
      const blindSig = client.GenerateWISchnorrBlindSignature(
        challenge.t,
        response,
      );
      console.log('final sig', blindSig);
      if (!client.VerifyWISchnorrBlindSignature(blindSig, info, uid)) {
        console.log(
          `wrong signature for ${app.name} (${verification})!`,
        );
        // eslint-disable-next-line no-continue
        continue;
      }

      await dispatch(
        updateSig({
          id: uid,
          changes: { sig: blindSig },
        }),
      );
    } catch (err) {
      console.log(
        `error in getting sig for ${app.name} (${verification})`,
        err,
      );
    }
  }
}

export const updateBlindSigs =
  () => async (dispatch: dispatch, getState: GetState) => {
    return new Promise(() => {
      InteractionManager.runAfterInteractions(async () => {
        const {
          apps: { apps },
        } = getState();
        // blind sigs for apps with no verification expiration time will be created at linking time
        const expirableBlindSigApps = apps.filter((app) =>
          app.usingBlindSig && app.verificationExpirationLength);
        for (const app of expirableBlindSigApps) {
          dispatch(updateBlindSig(app));
        }
      });
    });
  };

export const fetchApps = (api) => async (dispatch: dispatch, _) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err);
  }
};
