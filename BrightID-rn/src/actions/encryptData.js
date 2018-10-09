// @flow

import { createCipher, createDecipher } from 'react-native-crypto';

export const encryptUserData = () => (dispatch, getState) => {
  const { publicKey, userAvatar, nameornym } = getState().main;
  if (!publicKey || !userAvatar || !nameornym) return;
  const dataObj = {
    publicKey: Object.values(publicKey).join(),
    userAvatar: userAvatar.uri,
    nameornym,
  };
  const dataStr = JSON.stringify(dataObj);
  // console.log(dataStr);

  const cipher = createCipher('aes192', 'wadata');
  const decipher = createDecipher('aes192', 'wadata');

  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  console.log(decrypted);
};
