// @flow

import { SET_APPS, ADD_APP, REMOVE_APP, RESET_STORE, UPDATE_APP } from '@/actions';
import { find, propEq, mergeRight } from 'ramda';

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
    case UPDATE_APP: {
      const removeExisting = ({ name }) => name !== action.name;
      const updatedApp = find(propEq('name', action.name))(state.apps);
      updatedApp.state = (action.state === 'applied') ? 'applied' : 'failed'
      const apps: AppInfo[] = state.apps
        .filter(removeExisting)
        .concat(updatedApp);
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
