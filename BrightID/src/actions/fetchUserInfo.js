// @flow

import api from '../Api/BrightId';
import {
  setCurrentGroups,
  setEligibleGroups,
  setGroupsCount,
  setUserScore,
  setVerifications,
  updateConnections,
} from './index';

const fetchUserInfo = () => async (dispatch: dispatch, getState: getState) => {
  console.log('refreshing user info');
  const { id } = getState();
  if (!id) return;
  try {
    const {
      eligibleGroups,
      currentGroups,
      score,
      verifications = [],
      connections = [],
    } = await api.getUserInfo(id);
    dispatch(setEligibleGroups(eligibleGroups));
    dispatch(setCurrentGroups(currentGroups));
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setGroupsCount(currentGroups.length));
    dispatch(setVerifications(verifications));
    dispatch(updateConnections(connections));
  } catch (err) {
    console.log(err.message);
  }
};

export default fetchUserInfo;
