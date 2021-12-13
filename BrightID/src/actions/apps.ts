import _ from 'lodash';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { Alert } from 'react-native';
import { setApps, addSig, selectAllSigs } from '@/reducer/appsSlice';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';
import { isVerified } from '@/utils/verifications';

const WISchnorrClient = require('@/utils/WISchnorrClient');

export const updateBlindSigs =
  () => async (dispatch: dispatch, getState: GetState) => {
    const {
      user: { verifications /* , id */ },
      keypair: { secretKey },
      apps: { apps },
    } = getState();

    const verificationsByName = _.keyBy(verifications, (v) => v.name);
    const sigs = selectAllSigs(getState());
    console.log('sigs', sigs);
    const blindSigApps = apps.filter((app) => app.usingBlindSig);
    for (const app of blindSigApps) {
      const vel = app.verificationExpirationLength;
      const roundedTimestamp = vel ? Math.floor(Date.now() / vel) * vel : 0;
      for (const verification of app.verifications) {
        const sigInfo = sigs.find(
          (sig) => sig.app === app.id && sig.verification === verification,
        );
        if (sigInfo && sigInfo.roundedTimestamp === roundedTimestamp) {
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
          // noinspection HttpUrlsUsage
          const url = app.nodeUrl || `http://${network}.brightid.org`;
          const api = new NodeApi({ url, id, secretKey });
          const { wISchnorrPublic } = await api.getState();
          if (!wISchnorrPublic) {
            console.log('wISchnorrPublic is not set');
            // eslint-disable-next-line no-continue
            continue;
          }
          const client = new WISchnorrClient(wISchnorrPublic);
          const pub = await api.getPublic(
            app.id,
            roundedTimestamp,
            verification,
          );
          const uid = CryptoJS.enc.Base64.stringify(
            CryptoJS.lib.WordArray.random(16),
          );
          console.log(`using ${uid} for ${app.name} (${verification}) as uid`);
          const info = stringify({
            app: app.id,
            roundedTimestamp,
            verification,
          });
          const challenge = client.GenerateWISchnorrClientChallenge(
            pub,
            info,
            uid,
          );
          console.log(challenge, 'challenge');
          console.log(info, 'info');
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

          dispatch(
            addSig({
              uid,
              sig: blindSig,
              app: app.id,
              roundedTimestamp,
              verification,
              linked: false,
              linkedTimestamp: 0,
            }),
          );
        } catch (err) {
          console.log(
            `error in getting sig for ${app.name} (${verification})`,
            err,
          );
          Alert.alert(
            `error in getting sig for ${app.name} (${verification})`,
            (err as Error).message,
          );
        }
      }
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
