import {
  createSelector,
  createSlice,
  createEntityAdapter,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { connection_levels } from '@/utils/constants';
import { RESET_STORE } from '@/actions/resetStore';

/* ******** INITIAL STATE ************** */

const connectionsAdapter = createEntityAdapter<Connection>();

const initialState: ConnectionsState = {
  connections: connectionsAdapter.getInitialState(),
  connectionsSort: '',
  searchParam: '',
  searchOpen: false,
  filters: [
    connection_levels.SUSPICIOUS,
    connection_levels.JUST_MET,
    connection_levels.ALREADY_KNOWN,
    connection_levels.RECOVERY,
  ],
};

const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {
    setConnections(state, action: PayloadAction<Connection[]>) {
      state.connections = connectionsAdapter.setAll(state.connections, action);
    },
    setConnectionsSearch(state, action: PayloadAction<string>) {
      state.searchParam = action.payload;
    },
    setConnectionsSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
    setConnectionsSort(state, action: PayloadAction<string>) {
      state.connectionsSort = action.payload;
    },
    updateConnections(state, action: PayloadAction<Connection[]>) {
      state.connections = connectionsAdapter.upsertMany(
        state.connections,
        action,
      );
    },
    deleteConnection(state, action: PayloadAction<string>) {
      state.connections = connectionsAdapter.removeOne(
        state.connections,
        action,
      );
    },
    addConnection(state, action: PayloadAction<Connection>) {
      state.connections = connectionsAdapter.upsertOne(
        state.connections,
        action,
      );
    },
    hydrateConnections(
      state,
      action: PayloadAction<{ connections: Connection[] }>,
    ) {
      if (action.payload.connections) {
        state.connections = connectionsAdapter.setAll(
          state.connections,
          action.payload.connections,
        );
      }
    },
    flagAndHideConnection(
      state,
      action: PayloadAction<{ id: string; flag: string }>,
    ) {
      const { id, flag } = action.payload;
      const update: Update<Connection> = {
        id,
        changes: {
          status: 'hidden',
          hiddenFlag: flag,
        },
      };
      state.connections = connectionsAdapter.updateOne(
        state.connections,
        update,
      );
    },
    staleConnection(state, action: PayloadAction<string>) {
      const update: Update<Connection> = {
        id: action.payload,
        changes: { status: 'stale' },
      };
      state.connections = connectionsAdapter.updateOne(
        state.connections,
        update,
      );
    },
    setConnectionLevel(
      state,
      action: PayloadAction<{ id: string; level: ConnectionLevel }>,
    ) {
      const { id, level } = action.payload;
      const update: Update<Connection> = {
        id,
        changes: { level },
      };
      state.connections = connectionsAdapter.updateOne(
        state.connections,
        update,
      );
    },
    setFilters(state, action: PayloadAction<ConnectionLevel[]>) {
      state.filters = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

// Export channel actions
export const {
  setConnections,
  setConnectionsSearch,
  setConnectionsSearchOpen,
  setConnectionsSort,
  updateConnections,
  deleteConnection,
  addConnection,
  hydrateConnections,
  flagAndHideConnection,
  staleConnection,
  setFilters,
} = appsSlice.actions;

export const {
  selectById: selectConnectionById,
  selectAll: selectAllConnections,
} = connectionsAdapter.getSelectors(
  (state: State) => state.connections.connections,
);

// export const linkedContextTotal = createSelector(
//   selectAllLinkedContexts,
//   (contexts) =>
//     contexts.reduce(
//       (acc, link) => (link.state === 'applied' ? acc + 1 : acc),
//       0,
//     ),
// );

// export const selectLinkedContext = createSelector(
//   selectAllLinkedContexts,
//   (_: State, context: string) => context,
//   (contexts, context) => contexts.find((link) => link.context === context),
// );

// export const selectPendingLinkedContext = createSelector(
//   selectAllLinkedContexts,
//   (contexts) => contexts.find((link) => link.state === 'pending'),
// );

// Export reducer
export default appsSlice.reducer;
