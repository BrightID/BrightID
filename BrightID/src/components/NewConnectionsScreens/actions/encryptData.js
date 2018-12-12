// @flow

import { createCipher } from 'react-native-crypto';
import { Buffer } from 'buffer';
import { postData } from './postData';
import { retrieveAvatar } from '../../../utils/filesystem';

export const encryptAndUploadLocalData = () => async (dispatch, getState) => {
  const {
    publicKey,
    avatar: { uri },
    nameornym,
    connectQrData: { aesKey },
    trustScore,
  } = getState().main;

  // encode public key into a base64 string
  const base64Key = Buffer.from(publicKey).toString('base64');
  // retrieve avatar
  const avatar = await retrieveAvatar(uri);
  // encrypted via aes key from qr code

  const dataObj = {
    publicKey: base64Key,
    avatar,
    nameornym,
    trustScore,
  };

  const dataStr = JSON.stringify(dataObj);

  const cipher = createCipher('aes192', aesKey);

  let encrypted =
    cipher.update(dataStr, 'utf8', 'base64') + cipher.final('base64');
  console.log('encrypting data');
  dispatch(postData(encrypted));
};
