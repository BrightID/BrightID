import {
  channel_types,
  selectChannelById,
} from '@/components/PendingConnections/channelSlice';
import { addConnection, addOperation } from '@/actions';
import { saveImage } from '@/utils/filesystem';
import {
  backupPhoto,
  backupUser,
} from '@/components/Onboarding/RecoveryFlow/thunks/backupThunks';
import {
  confirmPendingConnection,
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from '@/components/PendingConnections/pendingConnectionSlice';
import {
  leaveChannel,
  encryptAndUploadProfileToChannel,
} from '@/components/PendingConnections/actions/channelThunks';
import { NodeApi } from '@/api/brightId';
import { connection_levels } from '@/utils/constants';

export const confirmPendingConnectionThunk =
  (
    id: string,
    level: ConnectionLevel,
    api: NodeApi,
    reportReason?: ReportReason,
  ) =>
  async (dispatch: AppDispatch, getState) => {
    const connection: PendingConnection = selectPendingConnectionById(
      getState(),
      id,
    );
    // validate pendingConnection state
    if (connection.state !== pendingConnection_states.UNCONFIRMED) {
      console.log(`Can't confirm - Connection is in state ${connection.state}`);
      return;
    }

    const {
      pendingConnectionData: { profileInfo, sharedProfile },
    } = connection;

    dispatch(
      updatePendingConnection({
        id,
        changes: {
          state: pendingConnection_states.CONFIRMING,
        },
      }),
    );

    const channel = selectChannelById(getState(), connection.channelId);
    console.log(
      `confirming connection ${id} in channel ${channel.id} with level '${level}'`,
    );

    const {
      user: { id: brightId, backupCompleted },
    } = getState();

    const connectionTimestamp = sharedProfile.profileTimestamp;
    const op = await api.addConnection(
      brightId,
      sharedProfile.id,
      level,
      connectionTimestamp,
      reportReason,
      sharedProfile.requestProof,
    );
    dispatch(addOperation(op));

    if (__DEV__) {
      // if peer is a fake connection also submit opposite addConnection operation
      if (sharedProfile.secretKey) {
        const op = await api.addConnection(
          sharedProfile.id,
          brightId,
          level,
          connectionTimestamp,
          reportReason,
          sharedProfile.requestProof,
          {
            id: sharedProfile.id,
            secretKey: sharedProfile.secretKey,
          },
        );
        dispatch(addOperation(op));
      }
    }

    // save connection photo
    const filename = await saveImage({
      imageName: sharedProfile.id,
      base64Image: sharedProfile.photo,
    });

    // create established connection from pendingConnection
    const connectionData: LocalConnectionData = {
      id: sharedProfile.id,
      name: sharedProfile.name,
      connectionDate: connectionTimestamp,
      photo: { filename },
      status: 'initiated',
      notificationToken: sharedProfile.notificationToken,
      secretKey: sharedProfile.secretKey,
      level,
      reportReason,
      socialMedia: sharedProfile.socialMedia,
      verifications: profileInfo?.verifications || [],
    };

    dispatch(addConnection(connectionData));
    dispatch(confirmPendingConnection(connection.profileId));

    const reported = Array<ConnectionLevel>(
      connection_levels.SUSPICIOUS,
      connection_levels.REPORTED,
    ).includes(level);

    // check connection level with initiator to decide next steps
    if (connection.profileId === channel.initiatorProfileId) {
      if (!reported) {
        // upload profile to channel only *after* accepting the connection with creator
        // to prevent leaking my profile info to unwanted connections
        await dispatch(encryptAndUploadProfileToChannel(channel.id));
      } else if (channel.type === channel_types.GROUP) {
        // immediately leave group connection channel if initiator got reported
        console.log(
          `Leaving group channel ${channel.id} cause I don't trust the initiator (level: '${level}')`,
        );
        dispatch(leaveChannel(channel.id));
      }
    }

    // Leave channel if no additional connections are expected
    if (
      channel.type === channel_types.SINGLE ||
      (channel.type === channel_types.STAR &&
        channel.initiatorProfileId !== channel.myProfileId)
    ) {
      dispatch(leaveChannel(channel.id));
    }

    if (backupCompleted) {
      await dispatch(backupPhoto(sharedProfile.id, filename));
      await dispatch(backupUser());
    }
  };
