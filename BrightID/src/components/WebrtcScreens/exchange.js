// @flow

import nacl from 'tweetnacl';
import { strToUint8Array } from '../../utils/encoding';

export const generateMessage = async () => (
  dispatch: () => null,
  getState: () => null,
) => {
  // set publickey from nearby connection
  // const {publicKey2} = new Uint8Array(Object.values(pk2));

  // dispatch(setPublicKey2(publicKey2));

  // generate timestamp
  const timestamp = Date.now();
  // obtain local public / secret keys
  const { publicKey, secretKey, publicKey2 } = getState().main;
  // message (publicKey1 + publicKey2 + timestamp) signed by the private key of the user represented by publicKey1
  if (!publicKey2) {
    return { error: 'no public key 2', msg: 'error - no public key 2' };
  }

  // this generates the message
  const message = strToUint8Array(
    JSON.stringify(publicKey) + JSON.stringify(publicKey2) + timestamp,
  );

  const sig1 = nacl.sign.detached(message, secretKey);
  const verify = nacl.sign.detached.verify(message, sig1, publicKey);
};

export const random = 'random';
