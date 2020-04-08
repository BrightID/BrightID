// @flow

import { SET_APPS, ADD_APP, REMOVE_APP } from '@/actions';

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
    case ADD_APP: {
      const removeExisting = ({ name }) => name !== action.app.name;
      const apps: AppInfo[] = state.apps
        .filter(removeExisting)
        .concat(action.app);

      return {
        ...state,
        apps,
      };
    }
    case REMOVE_APP: {
      const apps: AppInfo[] = state.apps.filter(
        (app) => app.name !== action.name,
      );
      return {
        ...state,
        apps,
      };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
