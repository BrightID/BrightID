// @flow

import {
  SET_BACKUP_PENDING,
  SET_DEVICE_TOKEN,
  SET_ACTIVE_NOTIFICATION,
  REMOVE_ACTIVE_NOTIFICATION,
  RESET_STORE,
} from '@/actions';

const initialState = {
  activeNotification: {},
  notifications: [],
  pendingConnections: [],
  backupPending: false,
  deviceToken: 'unavailable',
};

// not sure if this is the best way...

export const reducer = (
  state: NotificationsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_BACKUP_PENDING: {
      return { ...state, backupPending: action.backupPending };
    }
    case SET_DEVICE_TOKEN: {
      return { ...state, deviceToken: action.deviceToken };
    }
    case SET_ACTIVE_NOTIFICATION: {
      return { ...state, activeNotification: action.notification };
    }
    case REMOVE_ACTIVE_NOTIFICATION: {
      return { ...state, activeNotification: {} };
    }
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
