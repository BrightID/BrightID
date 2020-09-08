// @flow

import {
  SET_APPS,
  ADD_LINKED_CONTEXT,
  REMOVE_LINKED_CONTEXT,
  RESET_STORE,
} from '@/actions';

const initialState = {
  apps: [],
  linkedContexts: [],
  oldLinkedContexts: [],
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
      const contexts = action.apps.map((app) => app.context);
      const linkedContexts = state.linkedContexts.filter(({ context }) =>
        contexts.includes(context),
      );
      let oldLinkedContexts;
      if (linkedContexts.length !== state.linkedContexts.lenght) {
        oldLinkedContexts = state.linkedContexts
          .filter(({ context }) => !contexts.includes(context))
          .concat(state.oldLinkedContexts);
      } else {
        oldLinkedContexts = state.oldLinkedContexts;
      }
      return {
        ...state,
        apps: action.apps,
        linkedContexts,
        oldLinkedContexts,
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
