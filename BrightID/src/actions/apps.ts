import api from '@/api/brightId';

export const SET_APPS = 'SET_APPS';
export const ADD_LINKED_CONTEXT = 'ADD_LINKED_CONTEXT';
export const REMOVE_LINKED_CONTEXT = 'REMOVE_LINKED_CONTEXT';

export const setApps = (apps: AppInfo[]) => ({
  type: SET_APPS,
  apps,
});

export const addLinkedContext = (link: ContextInfo) => ({
  type: ADD_LINKED_CONTEXT,
  link,
});

export const removeLinkedContext = (context: string) => ({
  type: REMOVE_LINKED_CONTEXT,
  context,
});

export const fetchApps = () => async (dispatch: dispatch) => {
  try {
    const apps = await api.getApps();
    dispatch(setApps(apps));
  } catch (err) {
    console.log(err.message);
  }
};
