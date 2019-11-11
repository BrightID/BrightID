// @flow

import { AsyncStorage } from 'react-native';
import { setNotifications } from './index';
import { saveImage } from '../utils/filesystem';
import store from '../store';

export const getNotifications = () => async (dispatch: dispatch) => {
  try {
    let notifications = [];
    let backupCompleted = await AsyncStorage.getItem('backupCompleted');
    backupCompleted =  backupCompleted == 'true' ? true : false;
    // backupCompleted = false;
    if (!backupCompleted && store.getState().main.score > 0) {
      notifications.push({'icon': 'ios-star-outline', 'msg': 'Choose trusted connections to backup your BrightID'});
    }
    dispatch(setNotifications(notifications));
  } catch (err) {
    console.log(err);
  }
};

export type NotificationInfo = {
  msg: string,
  icon: string
};
