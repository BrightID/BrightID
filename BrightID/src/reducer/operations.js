// @flow

import { ADD_OPERATION, REMOVE_OPERATION, RESET_OPERATIONS } from '@/actions';

const initialState = {
  list: [],
};

export const reducer = (
  state: OperationsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case ADD_OPERATION: {
      const list: string[] = state.list.concat(action.op);
      return {
        ...state,
        list,
      };
    }
    case REMOVE_OPERATION: {
      const list: string[] = state.list.filter((op) => op !== action.op);
      return {
        ...state,
        list,
      };
    }
    case RESET_OPERATIONS: {
      return { ...state, list: [] };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
