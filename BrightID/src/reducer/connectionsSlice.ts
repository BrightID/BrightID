import {
  createEntityAdapter,
  createSelector,
  createSlice,
  PayloadAction,
  Update,
} from '@reduxjs/toolkit';
import { original } from 'immer';
import { difference } from 'ramda';
import { RESET_STORE } from '@brightid/redux/actions';
import { connection_levels } from '@/utils/constants';

/* ******** INITIAL STATE ************** */

const connectionsAdapter = createEntityAdapter<Connection>();

export const initialConnectionsState: ConnectionsState = {
  connections: connectionsAdapter.getInitialState(),
  connectionsSort: '',
  searchParam: '',
  searchOpen: false,
  firstRecoveryTime: 0,
  filters: [
    connection_levels.SUSPICIOUS,
    connection_levels.JUST_MET,
    connection_levels.ALREADY_KNOWN,
    connection_levels.RECOVERY,
  ],
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: initialConnectionsState,
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
      console.log('updating connections state');
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
    reportAndHideConnection(
      state,
      action: PayloadAction<{ id: string; reason: string }>,
    ) {
      const { id, reason } = action.payload;
      const update: Update<Connection> = {
        id,
        changes: {
          level: connection_levels.REPORTED,
          reportReason: reason,
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
    setReportReason(
      state,
      action: PayloadAction<{ id: string; reason: string | null }>,
    ) {
      const { id, reason } = action.payload;
      const update: Update<Connection> = {
        id,
        changes: { reportReason: reason },
      };
      state.connections = connectionsAdapter.updateOne(
        state.connections,
        update,
      );
    },
    setConnectionVerifications(
      state,
      action: PayloadAction<{ id: string; verifications: Verification[] }>,
    ) {
      const { id, verifications } = action.payload;
      const update: Update<Connection> = {
        id,
        changes: { verifications },
      };
      state.connections = connectionsAdapter.updateOne(
        state.connections,
        update,
      );
    },
    setFilters(state, action: PayloadAction<ConnectionLevel[]>) {
      state.filters = action.payload;
    },
    setFirstRecoveryTime(state, action) {
      state.firstRecoveryTime = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialConnectionsState;
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
  reportAndHideConnection,
  staleConnection,
  setFilters,
  setConnectionLevel,
  setConnectionVerifications,
  setReportReason,
  setFirstRecoveryTime,
} = connectionsSlice.actions;

export const {
  selectById: selectConnectionById,
  selectAll: selectAllConnections,
  selectTotal: connectionTotal,
} = connectionsAdapter.getSelectors(
  (state: RootState) => state.connections.connections,
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

export const firstRecoveryTimeSelector = (state: RootState) =>
  state.connections.firstRecoveryTime;

// Export reducer
export default connectionsSlice.reducer;
