import { PersistedState } from 'redux-persist';
import { asyncCreateMigrate, MigrationManifest } from './asyncCreateMigrate';

const findId = (conn: Connection) => conn.id;

type V9State = {
  connections: Connection[];
  connectionsSort: string;
  searchParam: string;
  searchOpen: boolean;
  filters: ConnectionLevel[];
} & PersistedState;

type V10State = ConnectionsState & PersistedState;

const connectionsMigrations: MigrationManifest = {
  10: async (state: V9State | V10State) => {
    // migrate connections to entity adapter
    if (Array.isArray(state.connections)) {
      const filteredConnections = state.connections.filter(findId);

      const ids = filteredConnections.map(findId);

      const entities = {};

      filteredConnections.forEach((conn) => {
        entities[findId(conn)] = conn;
      });

      state.connections = { ids, entities };
    }
    return state;
  },
};

export const connectionsMigrate = asyncCreateMigrate(connectionsMigrations, {
  debug: __DEV__,
});
