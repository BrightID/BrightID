import { InteractionManager } from 'react-native';
import _ from 'lodash';
import { NodeApi } from '@/api/brightId';
import { selectAllLinkedContexts } from '@/reducer/appsSlice';
import {
  setVerifications,
  updateMemberships,
  updateConnections,
  setIsSponsored,
  updateNotifications,
  setActiveDevices,
  setIsSponsoredv6,
} from './index';

const fetchUserInfo =
  (api: NodeApi) => (dispatch: AppDispatch, getState: getState) => {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(async () => {
        const {
          user: { id, isSponsored, isSponsoredv6 },
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
        // this section is added to recover sponsorships missed because of a bug
        // and should be removed in future releases
        if (!isSponsored && !isSponsoredv6) {
          console.log('checking missed sponsorships');
          const linkedContexts = selectAllLinkedContexts(getState());
          for (const contextInfo of linkedContexts) {
            try {
              const sp = await api.getSponsorship(contextInfo.contextId);
              if (sp && sp.appHasAuthorized && sp.spendRequested) {
                console.log(
                  `sponsored ${contextInfo.contextId} by ${contextInfo.context}`,
                );
                dispatch(setIsSponsoredv6(true));
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
      });
    });
  };

export default fetchUserInfo;
