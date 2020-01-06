// @flow

import { setNotifications } from './index';

export const getNotifications = () => async (
  dispatch: dispatch,
  getState: () => State,
) => {
  try {
    const { backupCompleted, connections } = getState();
    let notifications = [];
    // backupCompleted = false;
    if (!backupCompleted && connections.length > 2) {
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
