import CryptoJS from 'crypto-js';

export const getExplorerCode = (id: string, password: string) => {
  if (!password) {
    return null;
  }
  return CryptoJS.AES.encrypt(id, password).toString();
};
