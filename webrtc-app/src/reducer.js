// @flow

import { KEYS, PAIRING_MESSAGE, PUBLICKEY2, RESET_STORE } from './actions';

export const initialState = {
  publicKey: new Uint8Array(),
  secretKey: new Uint8Array(),
  message: '',
  messageStr: '',
  publicKey2: new Uint8Array(),
  avatar2: '',
  nameornym2: '',
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case KEYS:
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
    case PAIRING_MESSAGE:
      return {
        ...state,
        message: action.msg,
        messageStr: action.msgStr,
      };
    case RESET_STORE:
      return {
        ...state,
        message: '',
        messageStr: '',
        publicKey2: new Uint8Array(),
        avatar2: '',
        nameornym2: '',
      };
    default:
      return state;
  }
};

export default reducer;
