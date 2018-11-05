// @flow

import { createCipher, createDecipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { setEncryptedUserData } from './index';
import { postData } from './postData';
import { fetchData } from './fetchData';

export const encryptAndUploadLocalData = () => async (dispatch, getState) => {
  const {
    publicKey,
    userAvatar,
    nameornym,
    connectQrData: { aesKey },
  } = getState().main;
  // return here for testing
  if (!publicKey || !userAvatar || !nameornym || !aesKey) return;
  //

  const dataObj = {
    publicKey: Buffer.from(publicKey).toString('base64'),
    avatar: userAvatar.uri,
    nameornym,
  };

  const dataStr = JSON.stringify(dataObj);

  const cipher = createCipher('aes192', aesKey);

  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // dispatch(setEncryptedUserData(encrypted));
  // for testing
  dispatch(postData(encrypted));
  // setTimeout(() => dispatch(fetchData()), 1000);
  //
};
