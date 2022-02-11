import {
  createSlice,
  createEntityAdapter,
  createSelector,
} from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';
import {
  LOCAL_OPERATION_KEEP_THRESHOLD,
  operation_states,
} from '@/utils/constants';

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
    removeManyOperations: operationsAdapter.removeMany,
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
  removeManyOperations,
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

const outdatedStates = [
  operation_states.APPLIED,
  operation_states.FAILED,
  operation_states.EXPIRED,
];

/* Return IDs of operation entries that are outdated and can be removed from state */
export const selectOutdatedOperations = createSelector(
  selectAllOperations,
  (operations) => {
    const now = Date.now();
    return operations
      .filter(
        (op) =>
          outdatedStates.includes(op.state) &&
          now - op.timestamp > LOCAL_OPERATION_KEEP_THRESHOLD,
      )
      .map((op) => op.hash);
  },
);

export const scrubOps = () => (dispatch: dispatch, getState: getState) => {
  const removeOpIds = selectOutdatedOperations(getState());
  console.log(
    `Scrubbing ${removeOpIds.length} outdated operations: ${removeOpIds}`,
  );
  dispatch(removeManyOperations(removeOpIds));
};

// Export reducer
export default operationsSlice.reducer;
