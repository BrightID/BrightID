// @flow

export const SET_BACKUP_PENDING = 'SET_BACKUP_PENDING';

export const setBackupPending = (backupPending: boolean) => ({
  type: SET_BACKUP_PENDING,
  backupPending,
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
