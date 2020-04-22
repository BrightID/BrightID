// @flow

import { SET_RECOVERY_DATA, REMOVE_RECOVERY_DATA } from '@/actions';

export const initialState = {
  id: '',
  publicKey: '',
  secretKey: '',
  timestamp: 0,
  sigs: [],
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
        id: '',
        timestamp: 0,
        sigs: [],
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;
