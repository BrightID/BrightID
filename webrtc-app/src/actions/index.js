export const KEYS = 'KEYS';
export const PUBLICKEY2 = 'PUBLICKEY2';
export const RESET_STORE = 'RESET_STORE';
export const PAIRING_MESSAGE = 'PAIRING_MESSAGE';

export const setKeys = ({ publicKey, secretKey }) => ({
  type: KEYS,
  publicKey,
  secretKey,
});

export const setPublicKey2 = (publicKey2) => ({
  type: PUBLICKEY2,
  publicKey2,
});

export const setPairingMessage = ({ msg, msgStr }) => ({
  type: PAIRING_MESSAGE,
  msg,
  msgStr,
});

export const resetStore = () => ({
  type: RESET_STORE,
});
