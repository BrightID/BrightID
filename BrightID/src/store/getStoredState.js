// @flow
import { getStoredState } from 'redux-persist';
import { AsyncStorage } from './storage';
import { rootMigrate } from './migrations';

const getRootState = async (config) => {
  try {
    const restoredState = await getStoredState({
      ...config,
      key: 'root',
      storage: AsyncStorage,
      serialize: undefined,
      deserialize: undefined,
    });

    let migratedState = await rootMigrate(restoredState, config.version);
    console.log('migratedState', migratedState);
    return migratedState[config.key];
  } catch (error) {
    console.error(`failed restoring state for ${config.key}`, error.message);
  }
};

export default async (config) => {
  try {
    let restoredState = await getStoredState(config);
    return Promise.resolve(restoredState);
  } catch (err) {
    console.log(
      `attempting to restore old state for ${config.key}`,
      err.message,
    );
    return Promise.resolve(getRootState(config));
  }
};
