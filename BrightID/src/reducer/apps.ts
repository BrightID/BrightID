import {
  SET_APPS,
  ADD_LINKED_CONTEXT,
  REMOVE_LINKED_CONTEXT,
  RESET_STORE,
} from '@/actions';

const initialState: AppsState = {
  apps: [],
  linkedContexts: [],
};

export const reducer = (state: AppsState = initialState, action: action) => {
  switch (action.type) {
    case ADD_LINKED_CONTEXT: {
      const removeExisting = ({ context }) => context !== action.link.context;
      const linkedContexts: ContextInfo[] = state.linkedContexts
        .filter(removeExisting)
        .concat(action.link);
      return {
        ...state,
        linkedContexts,
      };
    }
    case REMOVE_LINKED_CONTEXT: {
      const removeExisting = ({ context }) => context !== action.context;
      const linkedContexts: ContextInfo[] = state.linkedContexts.filter(
        removeExisting,
      );

      return { ...state, linkedContexts };
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
