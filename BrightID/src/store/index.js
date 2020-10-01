// @flow

import AsyncStorage from '@react-native-community/async-storage';
import { combineReducers } from 'redux';

import { persistStore, persistReducer } from 'redux-persist';
import reducers from '@/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import FilesystemStorage from 'redux-persist-filesystem-storage';

import { migrate } from './migrations';
import {
  newGroupCoFoundersTransform,
  searchParamTransform,
  searchOpenTransform,
  notificationsTransformer,
} from './transform';

const rootPersistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [notificationsTransformer],
  version: 8,
  migrate,
  timeout: 0,
  blacklist: [
    'channels',
    'pendingConnections',
    'user',
    'connections',
    'groups',
  ],
};

const connectionsPersistConfig = {
  key: 'connections',
  storage: FilesystemStorage,
  timeout: 0,
  transforms: [searchParamTransform, searchOpenTransform],
};

const groupsPersistConfig = {
  key: 'groups',
  storage: FilesystemStorage,
  timeout: 0,
  transforms: [
    searchParamTransform,
    searchOpenTransform,
    newGroupCoFoundersTransform,
  ],
};

const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  timeout: 0,
  transforms: [searchParamTransform],
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
