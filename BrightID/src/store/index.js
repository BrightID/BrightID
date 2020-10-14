// @flow

import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import reducers from '@/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { FsStorage, KeychainStorage } from './storage';
import getStoredState from './getStoredState';

// update this in async migrate if changed to prevent require cycle

const version = 9;

const fsPersistConfig = {
  storage: FsStorage,
  timeout: 0,
  // debug: __DEV__,
  version,
  getStoredState,
};

const appsPersistConfig = {
  ...fsPersistConfig,
  key: 'apps',
};

const connectionsPersistConfig = {
  ...fsPersistConfig,
  key: 'connections',
  blacklist: ['searchParam', 'searchOpen'],
};

const groupsPersistConfig = {
  ...fsPersistConfig,
  key: 'groups',
  blacklist: ['searchParam', 'searchOpen', 'newGroupCoFounders'],
};

const notificationsPersistConfig = {
  ...fsPersistConfig,
  key: 'notifications',
  blacklist: ['activeNotification', 'sessionNotifications'],
};

const userPersistConfig = {
  ...fsPersistConfig,
  key: 'user',
  blacklist: ['searchParam', 'migrated'],
};

const keypairPersistConfig = {
  key: 'keypair',
  storage: KeychainStorage,
  timeout: 0,
  // debug: __DEV__,
  version,
  getStoredState,
  serialize: false,
  deserialize: false,
};

const rootReducer = combineReducers({
  ...reducers,
  apps: persistReducer(appsPersistConfig, reducers.apps),
  connections: persistReducer(connectionsPersistConfig, reducers.connections),
  groups: persistReducer(groupsPersistConfig, reducers.groups),
  keypair: persistReducer(keypairPersistConfig, reducers.keypair),
  notifications: persistReducer(
    notificationsPersistConfig,
    reducers.notifications,
  ),
  user: persistReducer(userPersistConfig, reducers.user),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    // We have a bunch of non-serializable data like secret key etc.
    // TODO For now disabled completely. Revisit later for fine-grained configuration.
    serializableCheck: false,
    immutableCheck: false,
  }),
});

export const persistor = persistStore(store);

export default store;
