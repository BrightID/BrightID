// @flow

import { Share } from 'react-native';
import store from '../../../store';

export const shareConnection = async () => {
  try {
    const {
      connectQrData: { qrString },
    } = store.getState();
    const result = await Share.share({
      message: qrString,
    });

    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (result.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
