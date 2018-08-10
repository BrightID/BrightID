// @flow

import nacl from 'tweetnacl';
import { strToUint8Array } from '../../utils/encoding';

export const generateMessage = async () => (
  dispatch: Function,
  getState: Function,
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
    publicKey.toString() + publicKey2.toString() + timestamp,
  );

  // console.warn(publicKey.toString());
  console.warn(Buffer.from(message).toString());
  const sig1 = nacl.sign.detached(message, secretKey);
  const verify = nacl.sign.detached.verify(message, sig1, publicKey);
  // console.warn(publicKey instanceof Uint8Array);
  console.warn(`message status: ${verify}`);
};

export const random = 'random';
