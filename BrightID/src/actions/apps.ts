import { setApps } from '@/reducer/appsSlice';

export const fetchApps = (api) => async (dispatch: dispatch, getState) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
