// @flow

import {
  KEYS_USER_A,
  PAIRING_MESSAGE,
  PUBLICKEY2,
  RESET_STORE_USER_A,
  TIMESTAMP,
  PUBLICKEY3,
  ARBITER_USER_A,
  USER_A_WAITING,
  RTC_ID,
  SET_USER_A_NAME,
  SET_USER_A_TRUST_SCORE,
} from '../actions';

const schema = {
  USERA: {
    OFFER: '',
    ICE_CANDIDATE: '',
    PUBLIC_KEY: '',
  },
  USERB: {
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
  nameornym: 'userA',
  message: '',
  messageStr: '',
  trustScore: '99.9',
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
    case KEYS_USER_A:
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
    case SET_USER_A_NAME:
      return {
        ...state,
        nameornym: action.name,
      };
    case SET_USER_A_TRUST_SCORE:
      return {
        ...state,
        trustScore: action.trustScore,
      };
    case RTC_ID:
      return {
        ...state,
        rtcId: action.rtcId,
      };
    case ARBITER_USER_A:
      return {
        ...state,
        arbiter: action.arbiter,
        waiting: false,
      };
    case USER_A_WAITING:
      return {
        ...state,
        waiting: true,
      };
    case RESET_STORE_USER_A:
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
