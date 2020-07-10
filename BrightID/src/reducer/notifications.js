// @flow

import {
  SET_BACKUP_PENDING,
  SET_DEVICE_TOKEN,
  SET_ACTIVE_NOTIFICATION,
  REMOVE_ACTIVE_NOTIFICATION,
  RESET_STORE,
} from '@/actions';
import { CONNECTIONS_TYPE, GROUPS_TYPE, MISC_TYPE } from '@/utils/constants';

const initialState = {
  activeNotification: null,
  notifications: [],
  pendingConnections: [],
  backupPending: false,
  deviceToken: 'unavailable',
  miscAlreadyNotified: false,
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
      let miscAlreadyNotified = !!state.miscAlreadyNotified;

      if (
        state.activeNotification?.type === CONNECTIONS_TYPE &&
        action.notification?.type !== CONNECTIONS_TYPE
      )
        return state;

      if (
        state.activeNotification?.type === GROUPS_TYPE &&
        action.notification?.type === MISC_TYPE
      )
        return state;

      if (action.notification?.type === MISC_TYPE && miscAlreadyNotified)
        return state;

      if (action.notification?.type === MISC_TYPE) miscAlreadyNotified = true;

      return {
        ...state,
        activeNotification: action.notification,
        miscAlreadyNotified,
      };
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
