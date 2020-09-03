// @flow

import { SET_APPS, ADD_LINKED_APP, RESET_STORE } from '@/actions';

const initialState = {
  apps: [],
  linkedApps: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case ADD_LINKED_APP: {
      const removeExisting = ({ context }) => context !== action.link.context;
      const linkedApps: LinkInfo[] = state.linkedApps
        .filter(removeExisting)
        .concat(action.link);
      return {
        ...state,
        linkedApps,
      };
    }
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

export default reducer;
