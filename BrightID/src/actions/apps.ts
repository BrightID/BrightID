import _ from 'lodash';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { InteractionManager } from 'react-native';
import { store } from '@/store';
import {
  setApps,
  upsertSig,
  updateSig,
  selectAllSigs,
  selectExpireableBlindSigApps,
} from '@/reducer/appsSlice';
import { hash, strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';
import { isVerified } from '@/utils/verifications';
import backupApi from '@/api/backupService';

const WISchnorrClient = require('@/utils/WISchnorrClient');

export const updateBlindSig =
  (app) => async (dispatch: dispatch, getState: GetState) => {
    const {
      user: { verifications, id },
      keypair: { secretKey },
    } = getState();
    const sigs = selectAllSigs(getState());
    const verificationsByName = _.keyBy(verifications, (v) => v.name);
    const vel = app.verificationExpirationLength;
    const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;
    for (const verification of app.verifications) {
      let sigInfo = sigs.find(
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
        console.log(`user is not verified for ${app.name} (${verification})`);
        // eslint-disable-next-line no-continue
        continue;
      }

      try {
        const network = __DEV__ ? 'test' : 'node';
        // TODO: Don't fallback to node.brightid.org. 'app.nodeUrl' should be mandatory.
        // noinspection HttpUrlsUsage
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
        let pub, uid: string;
        let challenge: WISchnorrChallenge;
        if (!sigInfo) {
          pub = await api.getPublic(app.id, roundedTimestamp, verification);
          uid = CryptoJS.enc.Base64.stringify(
            CryptoJS.lib.WordArray.random(16),
          );
          console.log(`using ${uid} for ${app.name} (${verification}) as uid`);
          challenge = client.GenerateWISchnorrClientChallenge(pub, info, uid);
          console.log(challenge, 'challenge');
          // store sig info before getting sig to be able to receive sig from server again
          // if app stopped just after querying the one time sig from the server
          sigInfo = {
            uid,
            app: app.id,
            roundedTimestamp,
            verification,
            pub,
            challenge,
            linked: false,
            linkedTimestamp: 0,
            signedTimestamp: Date.now(),
          };
          dispatch(upsertSig(sigInfo));
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
          console.log(`wrong signature for ${app.name} (${verification})!`);
          // eslint-disable-next-line no-continue
          continue;
        }

        const backupData = stringify({ ...sigInfo, sig: blindSig });
        const backupKey = hash(`${app.id} ${verification} ${roundedTimestamp}`);
        await encryptAndBackup(backupKey, backupData);

        dispatch(
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
  };

export const updateBlindSigs =
  () => async (dispatch: dispatch, getState: GetState) => {
    return new Promise(() => {
      InteractionManager.runAfterInteractions(async () => {
        const expireableBlindSigApps = selectExpireableBlindSigApps(getState());
        for (const app of expireableBlindSigApps) {
          dispatch(updateBlindSig(app));
        }
      });
    });
  };

const encryptAndBackup = async (key: string, data: string) => {
  const {
    user: { id, password },
  } = store.getState();
  const hashedId = hash(id + password);
  try {
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    await backupApi.putRecovery(hashedId, key, encrypted);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const fetchApps = (api) => async (dispatch: dispatch, _) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err);
  }
};
