// @flow

export const SET_BACKUP_PENDING = 'SET_BACKUP_PENDING';
export const SET_DEVICE_TOKEN = 'SET_DEVICE_TOKEN';
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

export const setActiveNotification = (notification: {
  title: string,
  message: string,
  payload: { [key: string]: string },
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
    } = getState();
    const verifiedConnections = connections.filter(
      (conn) => conn.status === 'verified',
    );
    if (!backupCompleted && verifiedConnections.length > 2) {
      dispatch(setBackupPending(true));
    } else {
      dispatch(setBackupPending(false));
    }
  } catch (err) {
    console.log(err);
  }
};
