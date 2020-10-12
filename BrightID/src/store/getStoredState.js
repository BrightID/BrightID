// @flow
import { getStoredState } from 'redux-persist';
import AsyncStorage from '@react-native-community/async-storage';
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

    return migratedState ? migratedState[config.key] : undefined;
  } catch (error) {
    console.error(`failed restoring state for ${config.key}`, error.message);
  }
};

export default async (config) => {
  try {
    let restoredState = await getStoredState(config);
    if (config.migrate) {
      restoredState = await config.migrate(restoredState, config.version);
    }
    return Promise.resolve(restoredState);
  } catch (err) {
    console.log(
      `attempting to restore old state for ${config.key}`,
      err.message,
    );
    return Promise.resolve(getRootState(config));
  }
};
