import {
  MIN_CONNECTIONS_FOR_RECOVERY_NOTIFICATION,
  MIN_RECOVERY_CONNECTIONS,
  MISC_TYPE,
} from '@/utils/constants';
import i18next from 'i18next';
import {
  recoveryConnectionsSelector,
  verifiedConnectionsSelector,
} from '@/utils/connectionsSelector';

export const SET_BACKUP_PENDING = 'SET_BACKUP_PENDING';
export const SET_DEVICE_TOKEN = 'SET_DEVICE_TOKEN';
export const SET_NOTIFICATION_TOKEN = 'SET_NOTIFICATION_TOKEN';
export const SET_ACTIVE_NOTIFICATION = 'SET_ACTIVE_NOTIFICATION';
export const REMOVE_ACTIVE_NOTIFICATION = 'REMOVE_ACTIVE_NOTIFICATION';
export const SET_RECOVERY_CONNECTIONS_PENDING =
  'SET_RECOVERY_CONNECTIONS_PENDING';

export const setBackupPending = (backupPending: boolean) => ({
  type: SET_BACKUP_PENDING,
  backupPending,
});

export const setRecoveryConnectionsPending = (
  recoveryConnectionsPending: boolean,
) => ({
  type: SET_RECOVERY_CONNECTIONS_PENDING,
  recoveryConnectionsPending,
});

export const setDeviceToken = (deviceToken: string) => ({
  type: SET_DEVICE_TOKEN,
  deviceToken,
});

export const setNotificationToken = (notificationToken: string) => ({
  type: SET_NOTIFICATION_TOKEN,
  notificationToken,
});

export const setActiveNotification = (notification: BannerNotification) => ({
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
  // check for pending backup setup
  try {
    const { password } = getState().user;
    if (!password) {
      dispatch(setBackupPending(true));
      dispatch(
        setActiveNotification({
          title: i18next.t('notificationBar.title.backupPassword'),
          message: i18next.t('notificationBar.text.backupPassword'),
          type: MISC_TYPE,
          oncePerSession: true,
          navigationTarget: 'Notifications',
          icon: 'PhoneLock',
        }),
      );
    } else {
      dispatch(setBackupPending(false));
    }
  } catch (err) {
    console.log(err);
  }

  // check for pending recovery connections
  try {
    const verifiedConnections = verifiedConnectionsSelector(getState());
    const recoveryConnections = recoveryConnectionsSelector(getState());
    if (
      recoveryConnections.length < MIN_RECOVERY_CONNECTIONS &&
      verifiedConnections.length >= MIN_CONNECTIONS_FOR_RECOVERY_NOTIFICATION
    ) {
      dispatch(setRecoveryConnectionsPending(true));
      dispatch(
        setActiveNotification({
          title: i18next.t('notificationBar.title.socialRecovery'),
          message: i18next.t('notificationBar.text.socialRecovery'),
          type: MISC_TYPE,
          oncePerSession: true,
          navigationTarget: 'Notifications',
          icon: 'PhoneLock',
        }),
      );
    } else {
      dispatch(setRecoveryConnectionsPending(false));
    }
  } catch (err) {
    console.log(err);
  }
};
