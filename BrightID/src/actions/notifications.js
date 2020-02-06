// @flow

import { setNotifications } from './index';

export const getNotifications = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    const { backupCompleted, connections } = getState();
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
