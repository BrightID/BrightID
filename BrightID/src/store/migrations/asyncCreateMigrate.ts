import { PersistedState, MigrationManifest } from 'redux-persist';

const VERSION = 9;

export function asyncCreateMigrate(
  migrations: MigrationManifest,
  config?: { debug: boolean },
) {
  let { debug } = config || {};
  return function(
    state: PersistedState,
    currentVersion: number,
  ): Promise<PersistedState> {
    if (!state) {
      if (debug)
        console.log('redux-persist: no inbound state, skipping migration');
      return Promise.resolve(undefined);
    }

    let inboundVersion: number = state?._persist?.version ?? VERSION - 1;

    if (inboundVersion === currentVersion) {
      if (debug) console.log('redux-persist: versions match, noop migration');
      return Promise.resolve(state);
    }
    if (inboundVersion > currentVersion) {
      if (debug)
        console.log('redux-persist: downgrading version is not supported');
      return Promise.resolve(state);
    }

    let migrationKeys = Object.keys(migrations)
      .map((ver) => parseInt(ver, 10))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b);

    if (debug) console.log('redux-persist: migrationKeys', migrationKeys);
    try {
      let migratedState = migrationKeys.reduce(async (stateP, versionKey) => {
        if (debug)
          console.log(
            'redux-persist: running migration for versionKey',
            versionKey,
          );
        let state = await stateP;
        return migrations[versionKey](state);
      }, Promise.resolve(state));
      return Promise.resolve(migratedState);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  };
}