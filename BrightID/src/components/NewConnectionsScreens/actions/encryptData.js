// @flow

import { createCipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { postData } from './postData';
// import { fetchData } from './fetchData';

export const encryptAndUploadLocalData = () => (dispatch, getState) => {
  const {
    publicKey,
    avatar,
    nameornym,
    connectQrData: { aesKey },
    trustScore,
  } = getState().main;

  // encode public key into a base64 string
  const base64Key = Buffer.from(publicKey).toString('base64');

  // encrypted via aes key from qr code

  const dataObj = {
    publicKey: base64Key,
    avatar: avatar.uri,
    nameornym,
    trustScore,
  };

  const dataStr = JSON.stringify(dataObj);

  const cipher = createCipher('aes192', aesKey);

  let encrypted =
    cipher.update(dataStr, 'utf8', 'base64') + cipher.final('base64');
  console.log('encrypting data');
  dispatch(postData(encrypted));
  // setTimeout(() => dispatch(fetchData()), 1000);
};
