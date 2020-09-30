// @flow

import api from '@/api/brightId';
import nacl from 'tweetnacl';
import { b64ToUint8Array, strToUint8Array, uInt8ArrayToB64 } from './encoding';

export const connectFakeUsers = async (
  fakeUser1: FakeUser,
  fakeUser2: FakeUser,
) => {
  let connectionTimestamp = Date.now();
  const message = `Add Connection${fakeUser1.id}${fakeUser2.id}${connectionTimestamp}`;

  // let both users sign the connection message
  const signedMessage1 = uInt8ArrayToB64(
    nacl.sign.detached(
      strToUint8Array(message),
      b64ToUint8Array(fakeUser1.secretKey),
    ),
  );
  const signedMessage2 = uInt8ArrayToB64(
    nacl.sign.detached(
      strToUint8Array(message),
      b64ToUint8Array(fakeUser2.secretKey),
    ),
  );

  await api.createConnection(
    fakeUser1.id,
    signedMessage1,
    fakeUser2.id,
    signedMessage2,
    connectionTimestamp,
  );
};
