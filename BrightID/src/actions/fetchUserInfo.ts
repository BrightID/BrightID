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

const fetchUserInfo = (api: NodeApi) => (dispatch: AppDispatch, getState) => {
  return InteractionManager.runAfterInteractions({
    name: 'fetchUserInfo',
    gen: async () => {
      const {
        user: { id, isSponsored, isSponsoredv6 },
      } = getState();

      if (!id) {
        console.log(`Can't fetch user info - id missing`);
        return;
      }

      console.log('refreshing user info', id);
      let verifications: Verification[] = [];
      try {
        verifications = await api.getVerifications(id);
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
      } catch (e) {
        console.log(
          `Error updating verifications: ${e instanceof Error ? e.message : e}`,
        );
      }

      // fetch additional aura verifications from aura node (https://github.com/BrightID/BrightID/issues/1081)
      // Remove this once aura verifications are available on all nodes!
      const hasAuraVerification =
        verifications.findIndex((v) => v.name.toLowerCase() === 'aura') >= 0;
      if (!hasAuraVerification) {
        try {
          const auraApi = new NodeApi({
            url: 'https://aura-node.brightid.org',
            secretKey: undefined,
            id: undefined,
          });
          const auraNodeVerifications = await auraApi.getVerifications(id);
          const auraVerification: Verification | undefined =
            auraNodeVerifications.find(
              (verification) => verification.name === 'Aura',
            );
          if (auraVerification) {
            verifications.push(auraVerification);
          }
        } catch (e) {
          console.log(
            `Error fetching verifications from Aura node: ${
              e instanceof Error ? e.message : e
            }`,
          );
        }
      }
      dispatch(setVerifications(verifications));

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
            console.log(
              `Error checking sponsorship for ${contextInfo.contextId}: ${
                e instanceof Error ? e.message : e
              }`,
            );
          }
        }
      }
    },
  });
};

export default fetchUserInfo;
