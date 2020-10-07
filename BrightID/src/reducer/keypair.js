// @flow

import { SET_KEYPAIR, RESET_STORE } from '@/actions';

const initialState = {
  publicKey: '',
  secretKey: new Uint8Array(),
};

export const reducer = (state: KeyPair = initialState, action: action) => {
  switch (action.type) {
    case SET_KEYPAIR: {
      return {
        publicKey: action.publicKey,
        secretKey: action.secretKey,
      };
    }
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
