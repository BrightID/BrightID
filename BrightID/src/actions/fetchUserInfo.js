// @flow

import api from '@/api/brightId';
import { updateInvites } from '@/utils/invites';
import { GROUP_TYPE } from '@/utils/constants';
import {
  setGroups,
  setInvites,
  setUserScore,
  setVerifications,
  updateConnections,
  setIsSponsored,
  updateNotifications,
  setActiveNotification,
} from './index';

const fetchUserInfo = () => async (dispatch: dispatch, getState: getState) => {
  const {
    user: { id },
    operations: { operations },
    groups: { invites: oldInvites },
  } = getState();
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
    dispatch(setUserScore(score));
    dispatch(setVerifications(verifications));
    dispatch(updateConnections(connections));
    dispatch(setIsSponsored(isSponsored));

    // this can not be done in reducer because it should be in an async function
    const newInvites = await updateInvites(invites);
    dispatch(setInvites(newInvites));

    if (newInvites.length > oldInvites.length) {
      const message =
        newInvites.length < 1
          ? `You have ${newInvites.length} new group invitations`
          : `You've been invited to join ${newInvites[0]?.name}`;
      dispatch(
        setActiveNotification({
          message,
          type: GROUP_TYPE,
        }),
      );
    }

    dispatch(updateNotifications());
  } catch (err) {
    console.log(err.message);
  }
};

export default fetchUserInfo;
