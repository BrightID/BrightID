// @flow

import api from '@/api/brightId';

export const SET_APPS = 'SET_APPS';
export const ADD_LINKED_APP = 'ADD_LINKED_APP';

export const setApps = (apps: AppInfo[]) => ({
  type: SET_APPS,
  apps,
});

export const addLinkedApp = (link: LinkInfo) => ({
  type: ADD_LINKED_APP,
  link,
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
