// @flow

import { createCipher, createDecipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { objToUint8 } from '../utils/encoding';
import { connectUserData } from './index';

export const decryptData = (data) => async (dispatch, getState) => {
  const { connectQrData } = getState().main;

  const { aesKey } = connectQrData;
  const decipher = createDecipher('aes192', aesKey);

  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  const decryptedObj = JSON.parse(decrypted);
  decryptedObj.publicKey = Buffer.from(decryptedObj.publicKey, 'base64');
  // decryptedObj.publicKey = objToUint8([...decryptedObj.publicKey]);
  console.log(decryptedObj);
};
