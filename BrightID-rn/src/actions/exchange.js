import nacl from 'tweetnacl';

import { setPublicKey2 } from './index';

export const GENERATE_MESSAGE = 'GENERATE_MESSAGE';

export const generateMessage = (publicKey2: object) => (
  dispatch: Function,
  getState: Function,
) => {
  // set publickey from nearby connection
  dispatch(setPublicKey2(publicKey2));
  // generate timestamp
  const timestamp = Date.now();
  const { publicKey, secretKey } = getState().main;

  // TODO convert secretKey to Uint8Array

  console.warn(secretKeyArray);
  const message =
    JSON.stringify(publicKey) + JSON.stringify(publicKey2) + timestamp;
  console.warn(message);
  // const signedMessage = nacl.sign(message, Object.keys(secretKey));
};
