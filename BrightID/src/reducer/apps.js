// @flow

import { SET_APPS } from '@/actions';
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
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
