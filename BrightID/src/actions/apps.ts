import { setApps } from '@/reducer/appsSlice';
import { selectNodeApi } from '@/reducer/settingsSlice';

export const fetchApps = () => async (dispatch: dispatch, getState) => {
  try {
    const api = selectNodeApi(getState());
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
