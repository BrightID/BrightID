// @flow

import { createCipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { postData } from './postData';
// import { fetchData } from './fetchData';

export const encryptAndUploadLocalData = () => (dispatch, getState) => {
  const {
    publicKey,
    userAvatar,
    nameornym,
    connectQrData: { aesKey },
  } = getState().main;

  // if (!publicKey || !userAvatar || !nameornym || !aesKey) return;

  const dataObj = {
    publicKey: Buffer.from(publicKey).toString('base64'),
    avatar: userAvatar.uri,
    nameornym,
  };

  const dataStr = JSON.stringify(dataObj);

  const cipher = createCipher('aes192', aesKey);

  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  console.log('encrypting data');
  dispatch(postData(encrypted));
  // setTimeout(() => dispatch(fetchData()), 1000);
};
