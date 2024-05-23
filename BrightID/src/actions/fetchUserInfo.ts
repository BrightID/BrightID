import { InteractionManager } from 'react-native';
import _ from 'lodash';
import { NodeApi } from '@/api/brightId';
import { selectAllLinkedContexts } from '@/reducer/appsSlice';
import {
  selectAllConnections,
  setActiveDevices,
  setConnections,
  setIsSponsored,
  setIsSponsoredv6,
  setVerifications,
  updateConnections,
  updateMemberships,
  updateNotifications,
} from './index';
import { saveImage } from '@/utils/filesystem';
import { fetchBackupData } from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';

const fetchUserInfo = (api: NodeApi) => (dispatch: AppDispatch, getState) => {
  return InteractionManager.runAfterInteractions({
    name: 'fetchUserInfo',
    gen: async () => {
      const {
        user: { id, isSponsored, isSponsoredv6, password },
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

        let connectionUpdatedFromBackupService = false;
        let connectionsFromBackupData: Connection[] | null = null;
        const currentConnections = selectAllConnections(getState());
        const connectionsFromApi = await api.getConnections(id, 'outbound');
        const connectionsUpdated = [...currentConnections];
        for (const connectionFromApi of connectionsFromApi) {
          const existingConnectionIndex = connectionsUpdated.findIndex(
            (connection) => connection.id === connectionFromApi.id,
          );
          if (existingConnectionIndex === -1) {
            if (!connectionsFromBackupData) {
              connectionsFromBackupData = JSON.parse(
                await dispatch(fetchBackupData('data', id, password)),
              ).connections;
            }
            const connectionFromBackupData = connectionsFromBackupData.find(
              (c) => c.id === connectionFromApi.id,
            );
            if (connectionFromBackupData) {
              connectionsUpdated.push(connectionFromApi);
              connectionUpdatedFromBackupService = true;
            }
          } else {
            if (
              connectionFromApi.timestamp >
              connectionsUpdated[existingConnectionIndex].timestamp
            ) {
              if (!connectionsFromBackupData) {
                connectionsFromBackupData = JSON.parse(
                  await dispatch(fetchBackupData('data', id, password)),
                ).connections;
              }
              const connectionFromBackupData = connectionsFromBackupData.find(
                (c) => c.id === connectionFromApi.id,
              );
              if (connectionFromBackupData) {
                const conn: Connection = { ...connectionFromBackupData };
                const decrypted = await dispatch(
                  fetchBackupData(conn.id, id, password),
                );
                const filename = await saveImage({
                  imageName: conn.id,
                  base64Image: decrypted,
                });
                conn.photo = { filename };
                connectionsUpdated[existingConnectionIndex] = conn;
                connectionUpdatedFromBackupService = true;
              }
            }
          }
        }
        if (connectionUpdatedFromBackupService) {
          dispatch(
            setConnections(
              connectionsUpdated.sort(
                (a, b) => b.connectionDate - a.connectionDate,
              ),
            ),
          );
        }

        const incomingConns = await api.getConnections(id, 'inbound');
        const incomingConnsById = _.keyBy(incomingConns, 'id');
        for (const conn of connectionsFromApi) {
          conn.incomingLevel = incomingConnsById[conn.id]?.level;
        }
        dispatch(updateConnections(connectionsFromApi));
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
