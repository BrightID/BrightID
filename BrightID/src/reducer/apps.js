// @flow

import { SET_APPS, ADD_LINK, RESET_STORE } from '@/actions';

const initialState = {
  apps: [],
  links: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case ADD_LINK: {
      const removeExisting = ({ context }) => context !== action.link.context;
      const links: LinkInfo[] = state.links
        .filter(removeExisting)
        .concat(action.link);
      return {
        ...state,
        links,
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
