import {
  createSelector,
  createSlice,
  createEntityAdapter,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { original } from 'immer';
import { difference } from 'ramda';
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
  pendingDeletions: {},
};

const connectionsSlice = createSlice({
  name: 'connections',
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
    updateConnections(state, action: PayloadAction<ConnectionInfo[]>) {
      const { entities, ids } = original(state.connections);
      // check to see if any connections are deleted
      const payloadIds = action.payload.map((conn) => conn.id);
      const diff = difference(ids, payloadIds);

      // remove missing connections
      diff.forEach((id) => {
        if (entities[id].status === 'verified') {
          // count number of times API has shown no connection on backend
          state.pendingDeletions[id] = state.pendingDeletions[id]
            ? state.pendingDeletions[id] + 1
            : 1;
          // remove connection after 4 API calls
          if (state.pendingDeletions[id] > 3) {
            state.connections = connectionsAdapter.removeOne(
              state.connections,
              id,
            );
            delete state.pendingDeletions[id];
          }
        }
      });

      // remove stale pendingDeletions
      Object.keys(original(state.pendingDeletions)).forEach((id) => {
        if (payloadIds.includes(id)) {
          delete state.pendingDeletions[id];
        }
      });

      state.connections = connectionsAdapter.updateMany(
        state.connections,
        action.payload.map((conn: Connection) => {
          conn.status = 'verified';
          return { id: conn.id, changes: conn };
        }),
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
  staleConnection,
  setFilters,
  setConnectionLevel,
} = connectionsSlice.actions;

export const {
  selectById: selectConnectionById,
  selectAll: selectAllConnections,
  selectTotal: connectionTotal,
} = connectionsAdapter.getSelectors(
  (state: State) => state.connections.connections,
);

export const verifiedConnectionsSelector = createSelector(
  selectAllConnections,
  (connections) => {
    return connections.filter((conn) => conn?.status === 'verified');
  },
);

export const recoveryConnectionsSelector = createSelector(
  [verifiedConnectionsSelector],
  (connections) => {
    return connections.filter(
      (conn) => conn?.level === connection_levels.RECOVERY,
    );
  },
);

// Export reducer
export default connectionsSlice.reducer;
