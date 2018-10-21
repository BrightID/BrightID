// @flow

import { createCipher, createDecipher } from 'react-native-crypto';
import { Buffer } from 'buffer';

export const encryptUserData = () => (dispatch, getState) => {
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
  const decipher = createDecipher('aes192', aesKey);

  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  const decryptedObj = JSON.parse(decrypted);
  console.log(decryptedObj.nameornym);
};
