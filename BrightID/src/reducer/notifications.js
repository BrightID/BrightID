// @flow

import {
  SET_BACKUP_PENDING,
  SET_INVITES,
  ACCEPT_INVITE,
  REJECT_INVITE,
  RESET_STORE,
} from '@/actions';

const initialState = {
  notifications: [],
  invites: [],
  pendingConnections: [],
  backupPending: false,
};

const backupNotification = {
  icon: 'ios-star-outline',
  msg: 'Choose trusted connections to backup your BrightID',
};

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
