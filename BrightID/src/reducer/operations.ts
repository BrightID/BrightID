import { ADD_OPERATION, REMOVE_OPERATION, RESET_OPERATIONS } from '@/actions';

const initialState = {
  operations: [],
};

export const reducer = (
  state: OperationsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case ADD_OPERATION: {
      const operations: operation[] = state.operations.concat(action.op);
      return {
        ...state,
        operations,
      };
    }
    case REMOVE_OPERATION: {
      const operations: operation[] = state.operations.filter(
        (op: operation) => op.hash !== action.opHash,
      );
      return {
        ...state,
        operations,
      };
    }
    case RESET_OPERATIONS: {
      return { ...state, operations: [] };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;