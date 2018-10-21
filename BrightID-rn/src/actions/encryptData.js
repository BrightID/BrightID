// @flow

import { createCipher, createDecipher } from 'react-native-crypto';

import { randomBytes } from 'react-native-randombytes';

export const encryptUserData = () => (dispatch, getState) => {
  const { publicKey, userAvatar, nameornym } = getState().main;
  if (!publicKey || !userAvatar || !nameornym) return;
  const dataObj = {
    publicKey: Object.values(publicKey).join(),
    userAvatar: userAvatar.uri,
    nameornym,
  };

  const dataStr = JSON.stringify(dataObj);
  let ipAddress = Buffer.from([192, 168, 0, 1]).toString('hex');
  console.log(ipAddress);
  ipAddress = Buffer.from(ipAddress, 'hex');
  console.log([...ipAddress]);
  const password = randomBytes(18).toString('base64');
  console.log(password);
  const cipher = createCipher('aes192', password);
  const decipher = createDecipher('aes192', password);

  let encrypted = cipher.update(dataStr, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  const decryptedObj = JSON.parse(decrypted);
  console.log(decryptedObj.nameornym);
};
