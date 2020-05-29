// @flow

import {
  SET_BACKUP_PENDING,
  SET_INVITES,
  SET_DEVICE_TOKEN,
  SET_ACTIVE_NOTIFICATION,
  REMOVE_ACTIVE_NOTIFICATION,
  ACCEPT_INVITE,
  REJECT_INVITE,
  RESET_STORE,
} from '@/actions';

const initialState = {
  activeNotification: {},
  notifications: [],
  invites: [],
  pendingConnections: [],
  backupPending: false,
  deviceToken: 'unavailable',
};

const backupNotification = {
  icon: 'ios-star-outline',
  msg: 'Choose trusted connections to backup your BrightID',
};

// not sure if this is the best way...
const setNotifications = (nextState: NotificationsState): Notification[] => [
  ...nextState.pendingConnections,
  ...(nextState.backupPending ? [backupNotification] : []),
  ...nextState.invites,
];

export const reducer = (
  state: NotificationsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_INVITES: {
      const nextState = { ...state, invites: action.invites };
      return { ...nextState, notifications: setNotifications(nextState) };
    }
    case ACCEPT_INVITE:
    case REJECT_INVITE: {
      const invites: invite[] = state.invites.filter(
        ({ inviteId }) => inviteId !== action.inviteId,
      );
      const nextState = { ...state, invites };
      return { ...nextState, notifications: setNotifications(nextState) };
    }
    case SET_BACKUP_PENDING: {
      const nextState = { ...state, backupPending: action.backupPending };
      return { ...nextState, notifications: setNotifications(nextState) };
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
