import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';

/* ******** INITIAL STATE ************** */

const operationsAdapter = createEntityAdapter<NodeOps>({
  selectId: (op) => op.hash,
});

const operationsSlice = createSlice({
  name: 'apps',
  initialState: operationsAdapter.getInitialState(),
  reducers: {
    addOperation: operationsAdapter.addOne,
    removeOperation: operationsAdapter.removeOne,
    resetOperations: operationsAdapter.removeAll,
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
} = operationsSlice.actions;

// export selectors
export const {
  selectById: selectOperationByHash,
  selectAll: selectAllOperations,
  selectTotal: selectOperationsTotal,
} = operationsAdapter.getSelectors((state: State) => state.operations);

// Export reducer
export default operationsSlice.reducer;
