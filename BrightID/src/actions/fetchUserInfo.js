// @flow

import api from '../Api/BrightId';
import { setCurrentGroups, setEligibleGroups, setGroupsCount, setUserScore } from './index';

const fetchUserInfo = () => async (dispatch: () => null) => {
  // async is unncessary here, but this is a useful template for handling the API
  try {
    let result = await api.getUserInfo();
    console.log(result);
    if (result && result.data && result.data.eligibleGroups) {
      let { eligibleGroups, currentGroups, score } = result.data;
      dispatch(setEligibleGroups(eligibleGroups));
      dispatch(setCurrentGroups(currentGroups));
      dispatch(setUserScore(score));
      dispatch(setGroupsCount(currentGroups.length));
    }
  } catch (err) {
    console.log(err);
  }
};

export default fetchUserInfo;
