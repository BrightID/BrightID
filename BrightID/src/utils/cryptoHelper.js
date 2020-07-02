// @flow

import CryptoJS from 'crypto-js';

export const encryptData = (dataObj, aesKey) => {
  const dataStr = JSON.stringify(dataObj);
  return CryptoJS.AES.encrypt(dataStr, aesKey).toString();
};

export const decryptData = (data, aesKey) => {
  const decrypted = CryptoJS.AES.decrypt(data, aesKey).toString(
    CryptoJS.enc.Utf8,
  );
  const decryptedObj = JSON.parse(decrypted);
  decryptedObj.aesKey = aesKey;
  return decryptedObj;
};
