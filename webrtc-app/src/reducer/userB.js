// @flow

import {
  KEYS_USER_B,
  PAIRING_MESSAGE,
  PUBLICKEY2,
  RESET_STORE,
  TIMESTAMP,
  PUBLICKEY3,
  DISPATCHER_USER_B,
  USER_B_WAITING,
  RTC_ID_USER_B,
} from '../actions';

export const initialState = {
  publicKey: new Uint8Array(),
  secretKey: new Uint8Array(),
  message: '',
  messageStr: '',
  publicKey2: new Uint8Array(),
  avatar2: '',
  nameornym2: '',
  timestamp: '',
  signedMsg: '',
  rtcId: '',
  waiting: false,
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
    case DISPATCHER_USER_B:
      return {
        ...state,
        dispatcher: action.dispatcher,
        waiting: false,
      };
    case RESET_STORE:
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
      };
    default:
      return state;
  }
};

export default reducer;
