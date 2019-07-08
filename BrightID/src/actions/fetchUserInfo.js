// @flow

import api from '../Api/BrightId';
import {
  setCurrentGroups,
  setEligibleGroups,
  setGroupsCount,
  setUserScore,
} from './index';

const fetchUserInfo = () => async (dispatch: dispatch) => {
  try {
    const { eligibleGroups, currentGroups, score } = await api.getUserInfo();
    dispatch(setEligibleGroups(eligibleGroups));
    dispatch(setCurrentGroups(currentGroups));
    dispatch(setUserScore(score));
    dispatch(setGroupsCount(currentGroups.length));
  } catch (err) {
    console.log(err);
  }
};

export default fetchUserInfo;
