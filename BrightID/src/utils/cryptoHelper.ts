import CryptoJS from 'crypto-js';

export const encryptData = (dataObj: any, aesKey: string) => {
  const dataStr = JSON.stringify(dataObj);
  return CryptoJS.AES.encrypt(dataStr, aesKey).toString();
};

export const decryptData = (data: string, aesKey: string) => {
  const decrypted = CryptoJS.AES.decrypt(data, aesKey).toString(
    CryptoJS.enc.Utf8,
  );
  return JSON.parse(decrypted);
};

export const hashSocialProfile = (data: string) =>
  CryptoJS.MD5(data).toString();
