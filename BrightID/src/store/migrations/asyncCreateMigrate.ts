import { PersistedState } from 'redux-persist';

export type MigrationManifest = {
  [key: string]: (state: PersistedState) => Promise<PersistedState>;
};

const VERSION = 11;

export function asyncCreateMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean },
) {
  const { debug } = config || {};
  return function (
    state: PersistedState,
    currentVersion: number,
  ): Promise<PersistedState> {
    if (!state) {
      if (debug)
        console.log('redux-persist: no inbound state, skipping migration');
      return Promise.resolve(undefined);
    }

    const inboundVersion: number = state?._persist?.version ?? VERSION - 1;

    if (inboundVersion === currentVersion) {
      if (debug) console.log('redux-persist: versions match, noop migration');
      return Promise.resolve(state);
    }
    if (inboundVersion > currentVersion) {
      if (debug)
        console.log('redux-persist: downgrading version is not supported');
      return Promise.resolve(state);
    }

    const migrationKeys = Object.keys(migrations)
      .map((ver) => parseInt(ver, 10))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b);

    if (debug) console.log('redux-persist: migrationKeys', migrationKeys);
    try {
      const migratedState = migrationKeys.reduce(async (stateP, versionKey) => {
        if (debug)
          console.log(
            'redux-persist: running migration for versionKey',
            versionKey,
          );
        const state = await stateP;
        return migrations[versionKey](state);
      }, Promise.resolve(state));
      return Promise.resolve(migratedState);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  };
}
