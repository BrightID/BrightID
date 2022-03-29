import { InteractionManager } from 'react-native';
import _ from 'lodash';
import { NodeApi } from '@/api/brightId';
import {
  setVerifications,
  updateMemberships,
  updateConnections,
  setIsSponsored,
  updateNotifications,
  setActiveDevices,
} from './index';

const fetchUserInfo =
  (api: NodeApi) => (dispatch: dispatch, getState: getState) => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const {
          user: { id },
        } = getState();

        if (!id) {
          console.log(`Can't fetch user info - id missing`);
          return;
        }

        console.log('refreshing user info', id);
        try {
          const verifications = await api.getVerifications(id);
          dispatch(setVerifications(verifications));
          const memberships = await api.getMemberships(id);
          dispatch(updateMemberships(memberships));
          const connections = await api.getConnections(id, 'outbound');
          const incomingConns = await api.getConnections(id, 'inbound');
          const incomingConnsById = _.keyBy(incomingConns, 'id');
          for (const conn of connections) {
            conn.incomingLevel = incomingConnsById[conn.id]?.level;
          }
          dispatch(updateConnections(connections));
          const { sponsored, signingKeys } = await api.getProfile(id);
          dispatch(setIsSponsored(sponsored));
          dispatch(setActiveDevices(signingKeys));
          dispatch(updateNotifications(api));
          resolve(null);
        } catch (err) {
          console.log(err.message);
        }
      });
    });
  };

export default fetchUserInfo;
