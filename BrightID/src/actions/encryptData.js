// @flow

import { createCipher, createDecipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { setEncryptedUserData } from './index';
import { postData } from './postData';
import { fetchData } from './fetchData';

export const encryptUserData = () => async (dispatch, getState) => {
  const { publicKey, userAvatar, nameornym, connectQrData } = getState().main;
  if (!publicKey || !userAvatar || !nameornym) return;
  const dataObj = {
    publicKey: Buffer.from(publicKey).toString('base64'),
    userAvatar: userAvatar.uri,
    nameornym,
  };

  const dataStr = JSON.stringify(dataObj);

  const { aesKey } = connectQrData;
  const cipher = createCipher('aes192', aesKey);
  // const decipher = createDecipher('aes192', aesKey);

  console.time('wadata');
  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  dispatch(setEncryptedUserData(encrypted));
  // for testing
  dispatch(postData(encrypted));
  setTimeout(() => dispatch(fetchData()), 1000);
  console.timeEnd('wadata');
  // let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  // decrypted += decipher.final('utf8');
  // const decryptedObj = JSON.parse(decrypted);
  // console.log(decryptedObj.nameornym);
};
