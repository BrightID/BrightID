import {
  SET_BACKUP_PENDING,
  SET_RECOVERY_CONNECTIONS_PENDING,
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
  recoveryConnectionsPending: false,
  deviceToken: null,
  notificationToken: null,
  sessionNotifications: [],
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
    case SET_RECOVERY_CONNECTIONS_PENDING: {
      return {
        ...state,
        recoveryConnectionsPending: action.recoveryConnectionsPending,
      };
    }
    case SET_DEVICE_TOKEN: {
      return { ...state, deviceToken: action.deviceToken };
    }
    case SET_NOTIFICATION_TOKEN: {
      return { ...state, notificationToken: action.notificationToken };
    }
    case SET_ACTIVE_NOTIFICATION: {
      const { notification } = action;
      // set null activeNotifications
      if (!notification) {
        return { ...state, activeNotification: null };
      }

      // handle once-per-session notifications
      if (notification.oncePerSession) {
        if (state.sessionNotifications.includes(notification.title)) {
          // Ignore if already notified before
          return state;
        }
      }

      // do not update the notification banner if the active is set as a new connection
      if (
        state.activeNotification?.type === CONNECTIONS_TYPE &&
        notification?.type !== CONNECTIONS_TYPE
      )
        return state;

      // do not update the notification banner if the alert is for backups,
      // and a notification is already displayed
      if (
        state.activeNotification?.type === GROUPS_TYPE &&
        notification?.type === MISC_TYPE
      )
        return state;

      const sessionNotifications = [...state.sessionNotifications];
      if (notification?.oncePerSession) {
        sessionNotifications.push(notification.title);
      }

      return {
        ...state,
        activeNotification: notification,
        sessionNotifications,
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

export default reducer;
