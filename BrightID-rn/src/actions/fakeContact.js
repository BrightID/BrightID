// @flow

import nacl from 'tweetnacl';
import {
  setConnectPublicKey,
  setConnectNameornym,
  setConnectAvatar,
  setConnectTrustScore,
  setConnectTimestamp,
} from './index';

export const addConnection = () => (dispatch) => {
  const { publicKey } = nacl.sign.keyPair();
  const timestamp = Date.now();
  const trustScore = '99.9';
  const nameornym = 'New Connect';

  // set public key
  dispatch(setConnectPublicKey(publicKey));

  // set nameornym

  dispatch(setConnectNameornym(nameornym));

  // set avatar

  // dispatch(setConnectAvatar(avatar));

  // set trust score

  dispatch(setConnectTrustScore(trustScore));

  dispatch(setConnectTimestamp(timestamp));
};
