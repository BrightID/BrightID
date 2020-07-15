// @flow

import {
  SET_APPS,
  RESET_STORE
} from '@/actions';
import { find, propEq } from 'ramda';

const initialState = {
  apps: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case SET_APPS: {
      return {
        ...state,
        apps: action.apps,
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

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
