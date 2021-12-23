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
import { leaveChannel } from '@/components/PendingConnections/actions/channelThunks';
import { NodeApi } from '@/api/brightId';

export const confirmPendingConnectionThunk = (
  id: string,
  level: ConnectionLevel,
  api: NodeApi,
) => async (dispatch: dispatch, getState: getState) => {
  const connection: PendingConnection = selectPendingConnectionById(
    getState(),
    id,
  );
  // validate pendingConnection state
  if (connection.state !== pendingConnection_states.UNCONFIRMED) {
    console.log(`Can't confirm - Connection is in state ${connection.state}`);
    return;
  }

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

  const connectionTimestamp = Date.now();
  let reportReason;

  const op = await api.addConnection(
    brightId,
    connection.brightId,
    level,
    connectionTimestamp,
    reportReason,
  );
  dispatch(addOperation(op));

  if (__DEV__) {
    // if peer is a fake connection also submit opposite addConnection operation
    if (connection.secretKey) {
      const op = await api.addConnection(
        connection.brightId,
        brightId,
        level,
        connectionTimestamp,
        reportReason,
        {
          id: connection.brightId,
          secretKey: connection.secretKey,
        },
      );
      dispatch(addOperation(op));
    }
  }

  // save connection photo
  const filename = await saveImage({
    imageName: connection.brightId,
    base64Image: connection.photo,
  });

  // create established connection from pendingConnection
  const connectionData: LocalConnectionData = {
    id: connection.brightId,
    name: connection.name,
    connectionDate: connectionTimestamp,
    photo: { filename },
    status: 'initiated',
    notificationToken: connection.notificationToken,
    secretKey: connection.secretKey,
    level,
    socialMedia: connection.socialMedia,
    verifications: connection.verifications,
  };

  dispatch(addConnection(connectionData));
  dispatch(confirmPendingConnection(connection.id));

  // Leave channel if no additional connections are expected
  if (
    channel.type === channel_types.SINGLE ||
    (channel.type === channel_types.STAR &&
      channel.initiatorProfileId !== channel.myProfileId)
  ) {
    dispatch(leaveChannel(channel.id));
  }

  if (backupCompleted) {
    await dispatch(backupPhoto(connection.brightId, filename));
    await dispatch(backupUser());
  }
};
