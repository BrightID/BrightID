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
const fetchUserInfo = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const {
      eligibleGroups,
      currentGroups,
      score,
      verifications = [],
      connections = [],
    } = await api.getUserInfo();
    const oldEligibleGroups = [...getState().eligibleGroups];
    const remained = oldEligibleGroups.filter( function( el ) {
      return (! eligibleGroups.some(x => x.id == el.id) && ! currentGroups.some(x => x.id == el.id))
    });
    dispatch(setEligibleGroups([...remained, ...eligibleGroups]));
    dispatch(setCurrentGroups(currentGroups));
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setGroupsCount(currentGroups.length));
    dispatch(setVerifications(verifications));
    dispatch(updateConnectionScores(connections));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export default fetchUserInfo;
