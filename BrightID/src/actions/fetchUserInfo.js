// @flow

import api from '../Api/BrightId';
import {
  setCurrentGroups,
  setEligibleGroups,
  setGroupsCount,
  setUserScore,
  setVerifications,
} from './index';
import { getNotifications } from './notifications';

const fetchUserInfo = () => async (dispatch: dispatch) => {
  try {
    const {
      eligibleGroups,
      currentGroups,
      score,
      verifications = [],
    } = await api.getUserInfo();
    dispatch(setEligibleGroups(eligibleGroups));
    dispatch(setCurrentGroups(currentGroups));
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setGroupsCount(currentGroups.length));
    dispatch(setVerifications(verifications));
    dispatch(getNotifications());
  } catch (err) {
    console.log(err);
  }
};

export default fetchUserInfo;
