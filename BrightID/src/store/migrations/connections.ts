import { PersistedState } from 'redux-persist';
import { asyncCreateMigrate, MigrationManifest } from './asyncCreateMigrate';
import {
  connection_levels,
  RECOVERY_COOLDOWN_EXEMPTION,
} from '@/utils/constants';

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
  11: async (state: ConnectionsState & PersistedState) => {
    // Set first recovery time if not yet set and user has existing RECOVERY connections
    if (!state.firstRecoveryTime) {
      if (state?.connections?.entities) {
        const recoveryConnections = Object.values(
          state.connections.entities,
        ).filter((conn) => conn.level === connection_levels.RECOVERY);
        if (recoveryConnections.length) {
          // assume existing connection was made longer ago than cooldown exception duration
          state.firstRecoveryTime =
            Date.now() - (RECOVERY_COOLDOWN_EXEMPTION + 60 * 1000);
        }
      }
    }
    return state;
  },
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
