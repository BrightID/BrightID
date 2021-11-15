import _ from 'lodash';
import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import { Parser } from 'expr-eval';
import stringify from 'fast-json-stable-stringify';
import {
  setApps,
  addSig,
  selectAllSigs,
} from '@/reducer/appsSlice';
import WISchnorrClient from '@/utils/WISchnorrClient';
import { strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import { NodeApi } from '@/api/brightId';

function isVerified(verifications, verification) {
  try {
    const expr = Parser.parse(verification);
    for (const v of expr.variables()) {
      if (!verifications[v]) {
        verifications[v] = false;
      }
    }
    return expr.evaluate(verifications);
  } catch (err) {
    console.log(`verification ${verification} can not be evaluated.`, err);
    return false;
  }
}

export const updateBlindSigs = (api) => async (
  dispatch: dispatch,
  getState,
) => {
  // dispatch(removeAllSigs(getState()));
  let {
    user: { verifications, id },
    keypair: { secretKey },
    apps: { apps },
  } = getState();

  const wISchnorrPublics = {};
  verifications = _.keyBy(verifications, (v) => v.name);
  const sigs = selectAllSigs(getState());
  console.log('sigs', sigs);
  apps = apps.filter((app) => app.usingBlindSig);
  for (const app of apps) {
    const vel = app.verificationExpirationLength;
    const roundedTimestamp = vel ? parseInt(Date.now() / vel) * vel : 0;
    for (const verification of app.verifications) {
      const sigInfo = sigs.find(
        (sig) => sig.app == app.id && sig.verification == verification,
      );
      if (sigInfo && sigInfo.roundedTimestamp == roundedTimestamp) {
        console.log(`sig exists for ${app.name} (${verification})`);
        continue;
      }
      if (!isVerified(verifications, verification)) {
        console.log(`user is not verified for ${app.name} (${verification})`);
        continue;
      }

      try {
        const network = __DEV__ ? 'test' : 'node';
        const url = app.nodeUrl || `http://${network}.brightid.org`;
        const api = new NodeApi({ url, id, secretKey });
        const { wISchnorrPublic } = await api.getState();
        if (!wISchnorrPublic) {
          console.log('wISchnorrPublic is not set');
          continue;
        }
        const client = new WISchnorrClient(wISchnorrPublic);
        const pub = await api.getPublic(app.id, roundedTimestamp, verification);
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
          nacl.sign.detached(strToUint8Array(s), secretKey)
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
          continue;
        }
        dispatch(
          addSig({
            sig: blindSig,
            app: app.id,
            roundedTimestamp,
            verification,
            uid,
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
};

export const fetchApps = (api) => async (dispatch: dispatch, getState) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
