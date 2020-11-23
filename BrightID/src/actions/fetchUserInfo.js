// @flow

import { InteractionManager } from 'react-native';
import api from '@/api/brightId';
import { updateInvites } from '@/utils/invites';
import { GROUPS_TYPE } from '@/utils/constants';
import {
  setGroups,
  setInvites,
  setUserScore,
  updateConnections,
  setIsSponsored,
  updateNotifications,
  setActiveNotification,
} from './index';

const fetchUserInfo = () => (dispatch: dispatch, getState: getState) => {
  return new Promise((resolve, reject) => {
    InteractionManager.runAfterInteractions(async () => {
      const {
        user: { id },
        operations: { operations },
        groups: { invites: oldInvites },
      } = getState();
      console.log('refreshing user info', id);
      if (!id) {
        throw new Error('id missing');
      }

      try {
        const {
          groups,
          score,
          connections = [],
          isSponsored,
          invites,
        } = await api.getUserInfo(id);

        if (operations.length === 0) {
          // don't update data when there are pending operations
          dispatch(setGroups(groups));
        }
        dispatch(setUserScore(score));
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
              title: 'Group Invitation',
              message,
              type: GROUPS_TYPE,
              navigationTarget: 'Notifications',
            }),
          );
        }

        dispatch(updateNotifications());
        resolve();
      } catch (err) {
        console.log(err.message);
      }
    });
  });
};

export default fetchUserInfo;
