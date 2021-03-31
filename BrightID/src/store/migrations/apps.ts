import { Dictionary } from '@reduxjs/toolkit';
import { PersistedState } from 'redux-persist';
import { asyncCreateMigrate, MigrationManifest } from './asyncCreateMigrate';

const findContextId = (item: ContextInfo) => item.contextId;

type V9State = {
  apps: AppInfo[];
  linkedContexts: ContextInfo[];
} & PersistedState;

type V10State = AppsState & PersistedState;

const appsMigrations: MigrationManifest = {
  10: async (state: V9State | V10State) => {
    if (Array.isArray(state.linkedContexts)) {
      const filteredContexts = state.linkedContexts.filter(findContextId);

      const ids = filteredContexts.map(findContextId);

      const entities: Dictionary<ContextInfo> = {};

      filteredContexts.forEach((context) => {
        entities[findContextId(context)] = context;
      });

      state.linkedContexts = { ids, entities };
    }

    return state as V10State;
  },
};

export const appsMigrate = asyncCreateMigrate(appsMigrations, {
  debug: __DEV__,
});
