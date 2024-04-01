import { persistReducer } from 'redux-persist';
import {
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  PreloadedState,
} from '@reduxjs/toolkit';
import { keypair } from '@brightid/redux/reducers';
import reducers from '@/reducer';
import FsStorage from './storage/fsStorageAdapter';
import KeychainStorage from './storage/keychainAdapter';
import getStoredState from './getStoredState';
import { appsMigrate } from './migrations/apps';
import { connectionsMigrate } from './migrations/connections';
import { ChannelsTransform, RecoveryDataTransform } from '@/store/transforms';

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
  blacklist: [
    'sigsUpdating',
    'appLinkingStep',
    'appLinkingStepText',
    'linkingAppInfo',
    'linkingAppError',
  ],
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
  blacklist: ['searchParam', 'migrated', 'localServerUrl'],
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

const operationsPersistConfig = {
  ...fsPersistConfig,
  key: 'operations',
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

const channelsPersistConfig = {
  ...fsPersistConfig,
  key: 'channels',
  transforms: [ChannelsTransform],
};

const recoveryDataPersistConfig = {
  ...fsPersistConfig,
  key: 'recoveryData',
  transforms: [RecoveryDataTransform],
};

export const rootReducer = combineReducers({
  ...reducers,
  apps: persistReducer(
    appsPersistConfig,
    reducers.apps,
  ) as typeof reducers.apps,
  connections: persistReducer(connectionsPersistConfig, reducers.connections),
  groups: persistReducer(groupsPersistConfig, reducers.groups),
  keypair: persistReducer(keypairPersistConfig, keypair),
  notifications: persistReducer(
    notificationsPersistConfig,
    reducers.notifications,
  ),
  socialMedia: persistReducer(socialMediaPersistConfig, reducers.socialMedia),
  tasks: persistReducer(tasksPersistConfig, reducers.tasks),
  user: persistReducer(userPersistConfig, reducers.user),
  settings: persistReducer(settingsPersistConfig, reducers.settings),
  operations: persistReducer(operationsPersistConfig, reducers.operations),
  devices: persistReducer(devicesPersistConfig, reducers.devices),
  channels: persistReducer(
    channelsPersistConfig,
    reducers.channels,
  ) as typeof reducers.channels,
  recoveryData: persistReducer(
    recoveryDataPersistConfig,
    reducers.recoveryData,
  ) as typeof reducers.recoveryData,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) => {
  return configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware({
      // We have a bunch of non-serializable data like secret key etc.
      // TODO For now disabled completely. Revisit later for fine-grained configuration.
      serializableCheck: false,
      immutableCheck: false,
    }),
    preloadedState,
  });
};
