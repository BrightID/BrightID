// @flow

import nacl from 'tweetnacl';
import pokemon from 'pokemon';
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
  const trustScore = Math.random() * 49.5 + 50.5;
  const nameornym = pokemon.random();

  // set public key
  dispatch(setConnectPublicKey(publicKey));

  // set nameornym

  dispatch(setConnectNameornym(nameornym));

  // set avatar

  // dispatch(setConnectAvatar(avatar));

  // set trust score

  dispatch(setConnectTrustScore(trustScore.toFixed(1)));

  dispatch(setConnectTimestamp(timestamp));
};
