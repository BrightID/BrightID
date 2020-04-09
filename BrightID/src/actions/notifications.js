// @flow

export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';

export const setNotifications = (notificationInfos: NotificationInfo[]) => ({
  type: SET_NOTIFICATIONS,
  notifications: notificationInfos,
});

export const getNotifications = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    const {
      user: { backupCompleted },
      connections: { connections },
    } = getState();
    let notifications = [];
    const verifiedConnections = connections.filter(
      (conn) => conn.status === 'verified',
    );
    // backupCompleted = false;
    if (!backupCompleted && verifiedConnections.length > 2) {
      notifications.push({
        icon: 'ios-star-outline',
        msg: 'Choose trusted connections to backup your BrightID',
      });
    }
    dispatch(setNotifications(notifications));
  } catch (err) {
    console.log(err);
  }
};
