import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

/* ******** INITIAL STATE ************** */

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
            state: 'unknown',
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

// Export channel actions
export const {
  addOperation,
  removeOperation,
  resetOperations,
  updateOperation,
} = operationsSlice.actions;

// export selectors
export const {
  selectById: selectOperationByHash,
  selectAll: selectAllOperations,
  selectTotal: selectOperationsTotal,
} = operationsAdapter.getSelectors((state: State) => state.operations);

const pendingStates = ['unknown', 'init', 'sent'];
export const selectPendingOperations = createSelector(
  selectAllOperations,
  (operations) => operations.filter((op) => pendingStates.includes(op.state)),
);

// Export reducer
export default operationsSlice.reducer;
