import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';
import { operation_states } from '@/utils/constants';

export type Operation = NodeOps & {
  state: typeof operation_states[keyof typeof operation_states];
};

const operationsAdapter = createEntityAdapter<Operation>({
  selectId: (op) => op.hash,
});

const operationsSlice = createSlice({
  name: 'operations',
  initialState: operationsAdapter.getInitialState(),
  reducers: {
    addOperation: {
      reducer: operationsAdapter.addOne,
      prepare: (operation: NodeOps) => {
        return {
          payload: {
            ...operation,
            state: operation_states.UNKNOWN,
          },
        };
      },
    },
    removeOperation: operationsAdapter.removeOne,
    resetOperations: operationsAdapter.removeAll,
    updateOperation: operationsAdapter.updateOne,
  },
  extraReducers: {
    [RESET_STORE]: operationsAdapter.removeAll,
  },
});

// Export actions
export const {
  addOperation,
  updateOperation,
  // removeOperation,
  // resetOperations,
} = operationsSlice.actions;

// export selectors
export const {
  selectById: selectOperationByHash,
  selectAll: selectAllOperations,
  selectTotal: selectOperationsTotal,
} = operationsAdapter.getSelectors((state: State) => state.operations);

const pendingStates = [
  operation_states.UNKNOWN,
  operation_states.INIT,
  operation_states.SENT,
];
export const selectPendingOperations = createSelector(
  selectAllOperations,
  (operations) => operations.filter((op) => pendingStates.includes(op.state)),
);

// Export reducer
export default operationsSlice.reducer;
