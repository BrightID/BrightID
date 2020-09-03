// @flow

import api from '@/api/brightId';

export const SET_APPS = 'SET_APPS';
export const ADD_LINK = 'ADD_LINK';

export const setApps = (appInfos: AppInfo[]) => ({
  type: SET_APPS,
  apps: appInfos,
});

export const addLink = (linkInfo: LinkInfo) => ({
  type: ADD_LINK,
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
