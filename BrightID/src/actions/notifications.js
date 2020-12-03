// @flow

import { MISC_TYPE } from '@/utils/constants';
import i18next from 'i18next';

export const SET_BACKUP_PENDING = 'SET_BACKUP_PENDING';
export const SET_DEVICE_TOKEN = 'SET_DEVICE_TOKEN';
export const SET_NOTIFICATION_TOKEN = 'SET_NOTIFICATION_TOKEN';
export const SET_ACTIVE_NOTIFICATION = 'SET_ACTIVE_NOTIFICATION';
export const REMOVE_ACTIVE_NOTIFICATION = 'REMOVE_ACTIVE_NOTIFICATION';

export const setBackupPending = (backupPending: boolean) => ({
  type: SET_BACKUP_PENDING,
  backupPending,
});

export const setDeviceToken = (deviceToken: string) => ({
  type: SET_DEVICE_TOKEN,
  deviceToken,
});

export const setNotificationToken = (notificationToken: string) => ({
  type: SET_NOTIFICATION_TOKEN,
  notificationToken,
});

export const setActiveNotification = (notification: {
  message: string,
  type: string,
}) => ({
  type: SET_ACTIVE_NOTIFICATION,
  notification,
});

export const removeActiveNotification = () => ({
  type: REMOVE_ACTIVE_NOTIFICATION,
});

export const updateNotifications = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    const {
      user: { backupCompleted },
      connections: { connections },
      notifications: { activeNotification },
    } = getState();
    const verifiedConnections = connections.filter(
      (conn) => conn.status === 'verified',
    );
    if (!backupCompleted && verifiedConnections.length > 6) {
      dispatch(setBackupPending(true));
      dispatch(
        setActiveNotification({
          title: i18next.t('notificationBar.title.socialRecovery'),
          message: i18next.t('notificationBar.text.socialRecovery'),
          type: MISC_TYPE,
          oncePerSession: true,
          navigationTarget: 'Notifications',
        }),
      );
    } else {
      dispatch(setBackupPending(false));
    }
  } catch (err) {
    console.log(err);
  }
};
