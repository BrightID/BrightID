import { InteractionManager } from 'react-native';
import _ from 'lodash';
import { NodeApi } from '@/api/brightId';
import {
  setVerifications,
  updateMemberships,
  updateConnections,
  setIsSponsored,
  updateNotifications,
} from './index';

const fetchUserInfo = (api: NodeApi) => (
  dispatch: dispatch,
  getState: getState,
) => {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(async () => {
      const {
        user: { id },
      } = getState();

      console.log('refreshing user info', id);
      if (!id) {
        throw new Error('id missing');
      }
      try {
        const verifications = await api.getVerifications(id);
        dispatch(setVerifications(verifications));
        const memberships = await api.getMemberships(id);
        dispatch(updateMemberships(memberships));
        const connections = await api.getConnections(id, 'outbound');
        let incomingConns = await api.getConnections(id, 'inbound');
        incomingConns = _.keyBy(incomingConns, 'id');
        for (const conn of connections) {
          conn.incomingLevel = incomingConns[conn.id]?.level;
        }
        dispatch(updateConnections(connections));

        const { sponsored } = await api.getProfile(id);
        dispatch(setIsSponsored(sponsored));
        dispatch(updateNotifications(api));
        resolve(null);
      } catch (err) {
        console.log(err.message);
      }
    });
  });
};

export default fetchUserInfo;
