// @flow

import { createCipher, createDecipher } from 'react-native-crypto';
import { objToUint8 } from '../utils/objToUint8';
import { connectUserData } from './index';
import { Buffer } from 'buffer';

export const decryptConnectData = (data) => (dispatch, getState) => {
  const { connectQrData } = getState().main;

  const { aesKey } = connectQrData;
  const cipher = createCipher('aes192', aesKey);
  const decipher = createDecipher('aes192', aesKey);

  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  const decryptedObj = JSON.parse(decrypted);
  decryptedObj.publicKey = Buffer.from(decrypted.publicKey, 'base64');
  decryptedObj.publicKey = objToUint8([...decryptedObj.publicKey.values()]);
};
