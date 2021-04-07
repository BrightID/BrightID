import { InteractionManager } from 'react-native';
import _ from 'lodash';
import { updateInvites } from '@/utils/invites';
import { GROUPS_TYPE } from '@/utils/constants';
import { NodeApi } from '@/api/brightId';
import {
  setGroups,
  setInvites,
  setUserScore,
  setVerifications,
  updateConnections,
  setIsSponsored,
  updateNotifications,
  setActiveNotification,
  selectOperationsTotal,
} from './index';

const fetchUserInfo = (api: NodeApi) => (
  dispatch: dispatch,
  getState: getState,
) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      const {
        user: { id },
        groups: { invites: oldInvites },
      } = getState();
      // const api = selectNodeApi(getState());

      const opTotal = selectOperationsTotal(getState());
      console.log('opTotal', opTotal);

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

        const verifications = await api.getUserVerifications(id);

        let incomingConns = await api.getConnections(id, 'inbound');

        incomingConns = _.keyBy(incomingConns, 'id');

        for (const conn of connections) {
          conn.incomingLevel = incomingConns[conn.id]?.level;
        }

        if (opTotal === 0) {
          // don't update data when there are pending operations.
          dispatch(setGroups(groups));
          dispatch(updateConnections(connections));
        }
        dispatch(setUserScore(score));
        dispatch(setVerifications(verifications));
        dispatch(setIsSponsored(isSponsored));

        // this can not be done in reducer because it should be in an async function
        const newInvites: Invite[] = await updateInvites(invites);

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
              icon: 'AddGroup',
            }),
          );
        }
        dispatch(updateNotifications());
        resolve(null);
      } catch (err) {
        console.log(err.message);
      }
    });
  });
};

export default fetchUserInfo;
