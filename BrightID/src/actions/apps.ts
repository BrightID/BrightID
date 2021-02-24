import api from '@/api/brightId';
import { setApps } from '@/reducer/appsSlice';

export const fetchApps = () => async (dispatch: dispatch) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
