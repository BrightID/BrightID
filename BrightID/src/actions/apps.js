// @flow

export const SET_APPS = 'SET_APPS';
export const ADD_APP = 'ADD_APP';
export const REMOVE_APP = 'REMOVE_APP';
export const UPDATE_APP = 'UPDATE_APP';

export const setApps = (appInfos: AppInfo[]) => ({
  type: SET_APPS,
  apps: appInfos,
});

export const addApp = (appInfo: AppInfo) => ({
  type: ADD_APP,
  app: appInfo,
});

export const removeApp = (name: string) => ({
  type: REMOVE_APP,
  name,
});

export const updateApp = (name: string, state: string) => ({
  type: UPDATE_APP,
  name,
  state,
});