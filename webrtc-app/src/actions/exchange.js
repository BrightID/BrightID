// @flow

import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import { strToUint8Array } from '../utils/encoding';

import { setPairingMessage } from '.';

export const GENERATE_MESSAGE = 'GENERATE_MESSAGE';

export const genMsg = (user: string) => (
  dispatch: Function,
  getState: Function,
) => {
  // set publickey from nearby connection
  const { publicKey, publicKey2, secretKey, timestamp } = getState()[user];

  // obtain local public / secret keys
  // message (publicKey1 + publicKey2 + timestamp) signed by the private key of the user represented by publicKey1
  let msg;
  if (user === 'userA') {
    msg = strToUint8Array(
      publicKey.toString() + publicKey2.toString() + timestamp,
    );
  } else if (user === 'userB') {
    msg = strToUint8Array(
      publicKey2.toString() + publicKey.toString() + timestamp,
    );
  }

  const msgStr = Buffer.from(msg).toString();

  const signedMsg = nacl.sign(msg, secretKey);

  dispatch(
    setPairingMessage({
      msg,
      msgStr,
      signedMsg,
    }),
  );

  // // testing signed message
  // const genKeys = nacl.sign.keyPair();
  // // console.warn(publicKey.toString());
  // console.log(Buffer.from(message).toString());
  // const sig1 = nacl.sign.detached(message, secretKey);
  // const sig2 = nacl.sign.detached(message, genKeys.secretKey);
  // // console.log(publicKey instanceof Uint8Array);
  // console.log(nacl.sign.detached.verify(message, sig1, publicKey));
  // console.log(nacl.sign.detached.verify(message, sig2, genKeys.publicKey));

  // console.warn(signedMessage);
};
