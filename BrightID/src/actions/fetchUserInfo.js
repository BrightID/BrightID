// @flow

import api from '@/Api/BrightId';
import { updateInvites } from '@/utils/invites';
import {
  setGroups,
  setInvites,
  setUserScore,
  setVerifications,
  updateConnections,
  setIsSponsored,
} from './index';

const fetchUserInfo = () => async (dispatch: dispatch, getState: getState) => {
  const { id, operations } = getState();
  console.log('refreshing user info', id);
  if (!id) return;
  try {
    const {
      groups,
      score,
      verifications = [],
      connections = [],
      isSponsored,
      invites,
    } = await api.getUserInfo(id);

    if (operations.length === 0) {
      // don't update data when there are pending operations
      dispatch(setGroups(groups));
    }
    dispatch(setUserScore(__DEV__ ? 100 : score));
    dispatch(setVerifications(verifications));
    dispatch(updateConnections(connections));
    dispatch(setIsSponsored(isSponsored));

    // this can not be done in reducer because it should be in an async function
    const newInvites = await updateInvites(invites);
    dispatch(setInvites(newInvites));
  } catch (err) {
    console.log(err.message);
  }
};

export default fetchUserInfo;
