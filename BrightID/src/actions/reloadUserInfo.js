// @flow

import api from '../Api/BrightIdApi';
import { setCurrentGroups, setEligibleGroups } from './index';

const reloadUserInfo = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  // async is unncessary here, but this is a useful template for handling the API
  try {
    let { publicKey } = getState().main;
    let result = await api.getUserInfo(publicKey);
    if (result && result.data && result.data.eligibleGroups) {
      let { eligibleGroups, currentGroups } = result.data;
      dispatch(setEligibleGroups(eligibleGroups));
      dispatch(setCurrentGroups(currentGroups));
    }
  } catch (err) {
    console.log(err);
  }
};

export default reloadUserInfo;
