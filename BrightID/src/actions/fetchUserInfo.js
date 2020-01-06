// @flow

import api from '../Api/BrightId';
import {
  setCurrentGroups,
  setEligibleGroups,
  setGroupsCount,
  setUserScore,
  setVerifications,
  updateConnectionScores,
} from './index';

// TODO update connections here
const fetchUserInfo = () => async (dispatch: dispatch) => {
  try {
    const {
      eligibleGroups,
      currentGroups,
      score,
      verifications = [],
      connections = [],
    } = await api.getUserInfo();
    dispatch(setEligibleGroups(eligibleGroups));
    dispatch(setCurrentGroups(currentGroups));
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setGroupsCount(currentGroups.length));
    dispatch(setVerifications(verifications));
    dispatch(updateConnectionScores(connections));
  } catch (err) {
    console.log(err);
  }
};

export default fetchUserInfo;
