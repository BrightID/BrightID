// @flow

import {
  KEYS_USER_B,
  PAIRING_MESSAGE,
  PUBLICKEY2,
  RESET_STORE_USER_B,
  TIMESTAMP,
  PUBLICKEY3,
  ARBITER_USER_B,
  USER_B_WAITING,
  RTC_ID_USER_B,
  SET_USER_B_NAME,
  SET_USER_B_TRUST_SCORE,
} from '../actions';

const schema = {
  ALPHA: {
    OFFER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
  ZETA: {
    ANSWER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
};

export const initialState = {
  publicKey: new Uint8Array(),
  secretKey: new Uint8Array(),
  boxKeypair: {
    publicKey: '',
    secretKey: '',
    nonce: 'wadata',
  },
  message: '',
  messageStr: '',
  trustScore: '99.9',
  nameornym: 'UserB',
  publicKey2: new Uint8Array(),
  avatar2: '',
  nameornym2: '',
  timestamp: '',
  signedMsg: '',
  rtcId: '',
  waiting: false,
  arbiter: schema,
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case KEYS_USER_B:
      return {
        ...state,
        publicKey: action.publicKey,
        secretKey: action.secretKey,
      };
    case PUBLICKEY2:
      return {
        ...state,
        publicKey2: new Uint8Array(Object.values(action.publicKey)),
        avatar2: action.avatar,
        nameornym2: action.nameornym,
      };
    case PUBLICKEY3:
      return {
        ...state,
        publicKey3: new Uint8Array(Object.values(action.publicKey)),
      };
    case PAIRING_MESSAGE:
      return {
        ...state,
        message: action.msg,
        messageStr: action.msgStr,
        signedMsg: action.signedMsg,
      };
    case TIMESTAMP:
      return {
        ...state,
        timestamp: action.timestamp,
      };
    case RTC_ID_USER_B:
      return {
        ...state,
        rtcId: action.rtcId,
      };
    case USER_B_WAITING:
      return {
        ...state,
        waiting: true,
      };
    case SET_USER_B_NAME:
      return {
        ...state,
        nameornym: action.name,
      };
    case SET_USER_B_TRUST_SCORE:
      return {
        ...state,
        trustScore: action.trustScore,
      };
    case ARBITER_USER_B:
      return {
        ...state,
        arbiter: action.arbiter,
        waiting: false,
      };
    case RESET_STORE_USER_B:
      return {
        ...state,
        message: '',
        messageStr: '',
        signedMsg: '',
        publicKey2: new Uint8Array(),
        publicKey3: new Uint8Array(),
        avatar2: '',
        nameornym2: '',
        timestamp: '',
        rtcId: '',
        arbiter: schema,
      };
    default:
      return state;
  }
};

export default reducer;
