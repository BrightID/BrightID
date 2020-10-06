// @flow

import AsyncStorage from '@react-native-community/async-storage';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import { combineReducers } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import reducers from '@/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import KeychainStorage from './keychainAdapater';

import { migrate } from './migrations';
import { notificationsTransformer } from './transform';

const version = 8;

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  debug: __DEV__,
  transforms: [notificationsTransformer],
  version,
  migrate,
  timeout: 0,
  blacklist: [
    'channels',
    'pendingConnections',
    'user',
    'connections',
    'groups',
    'recoveryData',
  ],
};

const connectionsPersistConfig = {
  key: 'connections',
  storage: FilesystemStorage,
  timeout: 0,
  debug: __DEV__,
  version,
  blacklist: ['searchParam', 'searchOpen'],
};

const groupsPersistConfig = {
  key: 'groups',
  storage: FilesystemStorage,
  timeout: 0,
  debug: __DEV__,
  version,
  blacklist: ['searchParam', 'searchOpen', 'newGroupCoFounders'],
};

const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  timeout: 0,
  debug: __DEV__,
  version,
  blacklist: ['searchParam'],
};

const keypairPersistConfig = {
  key: 'keypair',
  storage: KeychainStorage,
  timeout: 0,
  debug: __DEV__,
  version,
  serialize: false,
  deserialize: false,
};

const rootReducer = combineReducers({
  ...reducers,
  connections: persistReducer(connectionsPersistConfig, reducers.connections),
  groups: persistReducer(groupsPersistConfig, reducers.groups),
  user: persistReducer(userPersistConfig, reducers.user),
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    // We have a bunch of non-serializable data like secret key etc.
    // TODO For now disabled completely. Revisit later for fine-grained configuration.
    serializableCheck: false,
    immutableCheck: false,
  }),
});

export const persistor = persistStore(store);

export default store;
