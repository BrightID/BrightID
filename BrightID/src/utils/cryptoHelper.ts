import CryptoJS from 'crypto-js';
import nacl from 'tweetnacl';
import { b64ToUint8Array, UInt8ArrayEqual } from '@/utils/encoding';

export const encryptData = (dataObj: any, aesKey: string) => {
  const dataStr = JSON.stringify(dataObj);
  return CryptoJS.AES.encrypt(dataStr, aesKey).toString();
};

export const decryptData = (data: string, aesKey: string) => {
  const decrypted = CryptoJS.AES.decrypt(data, aesKey).toString(
    CryptoJS.enc.Utf8,
  );
  return JSON.parse(decrypted);
};

export const hashSocialProfile = (data: string) =>
  CryptoJS.MD5(data).toString();

export const verifyKeypair = ({
  publicKey,
  secretKey,
}: {
  publicKey: string;
  secretKey: Uint8Array;
}) => {
  // check public key
  if (!publicKey) {
    throw Error('Invalid keypair: publicKey undefined');
  }
  if (publicKey.length === 0) {
    throw Error(`Invalid keypair: publicKey empty`);
  }
  // publicKey is expected to be base64-encoded UInt8Array. Try to decode it.
  let pubKeyUInt8: Uint8Array;
  try {
    pubKeyUInt8 = b64ToUint8Array(publicKey);
  } catch {
    throw Error(`publicKey is not base64-encoded`);
  }
  if (pubKeyUInt8.length !== nacl.sign.publicKeyLength) {
    throw Error(
      `publicKey size wrong, expected: ${nacl.sign.publicKeyLength} - Actual: ${pubKeyUInt8.length}`,
    );
  }

  // check secret key
  if (!secretKey) {
    throw Error(`Invalid keypair: secretKey undefined`);
  }
  if (secretKey.length !== nacl.sign.secretKeyLength) {
    throw Error(
      `secretKey size wrong, expected: ${nacl.sign.secretKeyLength} - actual: ${secretKey.length}`,
    );
  }

  // check if public key matches secret key
  const { publicKey: newPub } = nacl.sign.keyPair.fromSecretKey(secretKey);
  if (!UInt8ArrayEqual(newPub, pubKeyUInt8)) {
    throw Error(`publicKey does not match secretKey`);
  }
};
