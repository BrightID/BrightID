// @flow

import api from '@/api/brightId';

export const SET_APPS = 'SET_APPS';
export const ADD_LINKED_APP = 'ADD_LINKED_APP';

export const setApps = (appInfos: AppInfo[]) => ({
  type: SET_APPS,
  apps: appInfos,
});

export const addLinkedApp = (linkInfo: LinkInfo) => ({
  type: ADD_LINKED_APP,
  link: linkInfo,
});

export const fetchApps = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
