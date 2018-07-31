// @flow

import { KEYS, PAIRING_MESSAGE, PUBLICKEY2, RESET_STORE } from './actions';

export const initialState = {
  publicKey: [],
  secretKey: [],
  message: '',
  messageStr: '',
  publicKey2: [],
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
        publicKey2: action.publicKey2,
      };
    case PAIRING_MESSAGE:
      return {
        ...state,
        message: action.msg,
        messageStr: action.msgStr,
      };
    case RESET_STORE:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
