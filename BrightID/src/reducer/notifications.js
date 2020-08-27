// @flow

import {
  SET_BACKUP_PENDING,
  SET_DEVICE_TOKEN,
  SET_ACTIVE_NOTIFICATION,
  SET_NOTIFICATION_TOKEN,
  REMOVE_ACTIVE_NOTIFICATION,
  RESET_STORE,
} from '@/actions';
import { CONNECTIONS_TYPE, GROUPS_TYPE, MISC_TYPE } from '@/utils/constants';

const initialState = {
  activeNotification: null,
  backupPending: false,
  deviceToken: '',
  notificationToken: '',
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
    case SET_NOTIFICATION_TOKEN: {
      return { ...state, notificationToken: action.notificationToken };
    }
    case SET_ACTIVE_NOTIFICATION: {
      // we only want to notify the user to backup once per session
      let miscAlreadyNotified = !!state.miscAlreadyNotified;

      // set null activeNotifications
      if (!action.notification) {
        return { ...state, activeNotification: null };
      }

      // do not update the notification banner if the active is set as a new connection
      if (
        state.activeNotification?.type === CONNECTIONS_TYPE &&
        action.notification?.type !== CONNECTIONS_TYPE
      )
        return state;

      // do not update the notification banner if the alert is for backups,
      // and a notification is already displayed
      if (
        state.activeNotification?.type === GROUPS_TYPE &&
        action.notification?.type === MISC_TYPE
      )
        return state;

      // do not notify the user to backup their brightid if they've already been notified
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
