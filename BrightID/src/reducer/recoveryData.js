// @flow

import { SET_RECOVERY_DATA, REMOVE_RECOVERY_DATA, RESET_STORE } from '@/actions';

export const initialState = {
  id: '',
  name: '',
  photo: '',
  publicKey: '',
  secretKey: '',
  aesKey: '',
  timestamp: 0,
  updateTimestamp: 0,
  sigs: {},
  completedItems: 0,
  totalItems: 0,
};

export const reducer = (state: RecoveryData = initialState, action: action) => {
  switch (action.type) {
    case SET_RECOVERY_DATA: {
      return {
        ...action.recoveryData,
      };
    }
    case REMOVE_RECOVERY_DATA: {
      return {
        publicKey: '',
        secretKey: '',
        aesKey: '',
        id: '',
        name: '',
        photo: '',
        timestamp: 0,
        updateTimestamp: 0,
        sigs: {},
        completedItems: 0,
        totalItems: 0,
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
