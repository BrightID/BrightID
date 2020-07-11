// @flow

import api from '@/Api/BrightId';
export const SET_APPS = 'SET_APPS';

export const setApps = (appInfos: AppInfo[]) => ({
  type: SET_APPS,
  apps: appInfos,
});

export const fetchApps = () => async (dispatch: dispatch, getState: getState) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
