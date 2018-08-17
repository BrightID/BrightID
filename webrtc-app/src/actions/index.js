export const KEYS_USER_A = 'KEYS_USER_A';
export const KEYS_USER_B = 'KEYS_USER_B';
export const PUBLICKEY2 = 'PUBLICKEY2';
export const PUBLICKEY3 = 'PUBLICKEY3';
export const RESET_STORE_USER_A = 'RESET_STORE_USER_A';
export const RESET_STORE_USER_B = 'RESET_STORE_USER_B';
export const PAIRING_MESSAGE = 'PAIRING_MESSAGE';
export const TIMESTAMP = 'TIMESTAMP';
export const RTC_ID = 'RTC_ID';
export const RTC_ID_USER_B = 'RTC_ID_USER_B';
export const ARBITER_USER_A = 'ARBITER_USER_A';
export const ARBITER_USER_B = 'ARBITER_USER_B';
export const USER_A_WAITING = 'USER_A_WAITING';
export const USER_B_WAITING = 'USER_B_WAITING';

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

export const resetUserAStore = () => ({
  type: RESET_STORE_USER_A,
});

export const resetUserBStore = () => ({
  type: RESET_STORE_USER_B,
});

export const setTimestamp = (timestamp) => ({
  type: TIMESTAMP,
  timestamp,
});

export const setRtcId = (rtcId) => ({
  type: RTC_ID,
  rtcId,
});

export const setUserBRtcId = (rtcId) => ({
  type: RTC_ID_USER_B,
  rtcId,
});

export const userAWaiting = () => ({
  type: USER_A_WAITING,
});

export const userBWaiting = () => ({
  type: USER_B_WAITING,
});

export const setUserAArbiter = (arbiter) => ({
  type: ARBITER_USER_A,
  arbiter,
});

export const setUserBArbiter = (arbiter) => ({
  type: ARBITER_USER_B,
  arbiter,
});
