// @flow

import { SET_CONNECT_USER_DATA, REMOVE_CONNECT_USER_DATA } from '@/actions';

export const initialState = {
  id: '',
  photo: '',
  name: '',
  timestamp: 0,
  signedMessage: '',
  score: 0,
};

export const reducer = (
  state: ConnectUserData = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_CONNECT_USER_DATA: {
      return {
        ...action.connectUserData,
      };
    }
    case REMOVE_CONNECT_USER_DATA: {
      return {
        id: '',
        photo: '',
        name: '',
        timestamp: 0,
        signedMessage: '',
        score: 0,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;
