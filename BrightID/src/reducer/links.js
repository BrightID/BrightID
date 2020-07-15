// @flow

import {
  ADD_LINK,
  RESET_STORE,
} from '@/actions';
import { find, propEq } from 'ramda';

const initialState = {
  links: [],
};

export const reducer = (state: LinksState = initialState, action: action) => {
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
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
