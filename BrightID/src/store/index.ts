import { combineReducers } from 'redux';
import {
  useDispatch as originalUseDispatch,
  useSelector as originalUseSelector,
  TypedUseSelectorHook,
} from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import reducers from '@/reducer';
import FsStorage from './storage/fsStorageAdapter';
import KeychainStorage from './storage/keychainAdapter';
import getStoredState from './getStoredState';
import { appsMigrate } from './migrations/apps';
import { connectionsMigrate } from './migrations/connections';

// update this in async migrate if changed to prevent require cycle

const version = 11;

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
  migrate: appsMigrate,
};

const connectionsPersistConfig = {
  ...fsPersistConfig,
  key: 'connections',
  migrate: connectionsMigrate,
  blacklist: ['searchParam', 'searchOpen', 'filters'],
};

const groupsPersistConfig = {
  ...fsPersistConfig,
  key: 'groups',
  blacklist: ['searchParam', 'searchOpen', 'newGroupInvitees'],
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

const tasksPersistConfig = {
  ...fsPersistConfig,
  key: 'tasks',
};

const devicesPersistConfig = {
  ...fsPersistConfig,
  key: 'devices',
};

const socialMediaPersistConfig = {
  ...fsPersistConfig,
  key: 'socialMedia',
};

const settingsPersistConfig = {
  ...fsPersistConfig,
  key: 'settings',
  blacklist: ['baseUrl'],
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
  socialMedia: persistReducer(socialMediaPersistConfig, reducers.socialMedia),
  tasks: persistReducer(tasksPersistConfig, reducers.tasks),
  user: persistReducer(userPersistConfig, reducers.user),
  settings: persistReducer(settingsPersistConfig, reducers.settings),
  devices: persistReducer(devicesPersistConfig, reducers.devices),
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch = () => originalUseDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = originalUseSelector;

export default store;
