// @flow

import { SET_APPS, ADD_APP, REMOVE_APP } from '@/actions';

const initialState = {
  list: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case SET_APPS: {
      return {
        ...state,
        list: action.apps,
      };
    }
    case ADD_APP: {
      const removeExisting = ({ name }) => name !== action.app.name;
      const list: AppInfo[] = state.list
        .filter(removeExisting)
        .concat(action.app);

      return {
        ...state,
        list,
      };
    }
    case REMOVE_APP: {
      const list: AppInfo[] = state.list.filter(
        (app) => app.name !== action.name,
      );

      return {
        ...state,
        list,
      };
    }

    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
