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
      if (ids.length !== action.payload.length) {
        const payloadIds = action.payload.map((conn) => conn.id);
        const diff = difference(ids, payloadIds);
        diff.forEach((id) => {
          if (entities[id].status === 'verified') {
            state.connections = connectionsAdapter.updateOne(
              state.connections,
              {
                id,
                changes: {
                  status: 'deleted',
                },
              },
            );
          }
        });
      }

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
