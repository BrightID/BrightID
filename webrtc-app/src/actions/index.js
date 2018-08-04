export const KEYS_USER_A = 'KEYS_USER_A';
export const KEYS_USER_B = 'KEYS_USER_B';
export const PUBLICKEY2 = 'PUBLICKEY2';
export const PUBLICKEY3 = 'PUBLICKEY3';
export const RESET_STORE = 'RESET_STORE';
export const PAIRING_MESSAGE = 'PAIRING_MESSAGE';
export const TIMESTAMP = 'TIMESTAMP';
export const RTC_ID = 'RTC_ID';
export const DISPATCHER = 'DISPATCHER';

export const setKeys = ({ user, publicKey, secretKey }) => ({
  type: user === 'userA' ? KEYS_USER_A : KEYS_USER_B,
  publicKey,
  secretKey,
});

export const setPublicKey2 = ({ publicKey, avatar, nameornym }) => ({
  type: PUBLICKEY2,
  publicKey,
  avatar,
  nameornym,
});

export const setPublicKey3 = (publicKey) => ({
  type: PUBLICKEY3,
  publicKey,
});

export const setPairingMessage = ({ msg, msgStr, signedMsg }) => ({
  type: PAIRING_MESSAGE,
  msg,
  msgStr,
  signedMsg,
});

export const resetStore = () => ({
  type: RESET_STORE,
});

export const setTimestamp = (timestamp) => ({
  type: TIMESTAMP,
  timestamp,
});

export const setRtcId = (rtcId) => ({
  type: RTC_ID,
  rtcId,
});

export const setDispatcher = (dispatcher) => ({
  type: DISPATCHER,
  dispatcher,
});
