// @flow
import {
  channel_types,
  selectChannelById,
} from '@/components/PendingConnectionsScreens/channelSlice';
import api from '@/api/brightId';
import { addConnection } from '@/actions';
import { saveImage } from '@/utils/filesystem';
import { backupPhoto, backupUser } from '@/components/Recovery/helpers';
import {
  confirmPendingConnection,
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { leaveChannel } from '@/components/PendingConnectionsScreens/actions/channelThunks';

export const confirmPendingConnectionThunk = (
  id: string,
  level: ConnectionLevel,
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

  let connectionTimestamp = Date.now();
  let reportReason;

  await api.addConnection(
    brightId,
    connection.brightId,
    level,
    reportReason,
    connectionTimestamp,
  );

  if (__DEV__) {
    // if peer is a fake connection also submit opposite addConnection operation
    if (connection.secretKey) {
      await api.addConnection(
        connection.brightId,
        brightId,
        level,
        reportReason,
        connectionTimestamp,
        {
          id: connection.brightId,
          secretKey: connection.secretKey,
        },
      );
    }
  }

  // save connection photo
  const filename = await saveImage({
    imageName: connection.brightId,
    base64Image: connection.photo,
  });

  // create established connection from pendingConnection
  const connectionData = {
    id: connection.brightId,
    name: connection.name,
    connectionDate: connectionTimestamp,
    photo: { filename },
    status: 'initiated',
    notificationToken: connection.notificationToken,
    secretKey: connection.secretKey,
    level,
    socialMedia: connection.socialMedia,
  };

  dispatch(addConnection(connectionData));
  dispatch(confirmPendingConnection(connection.id));

  if (channel.type === channel_types.SINGLE) {
    // Connection is established, so the 1:1 channel can be left
    dispatch(leaveChannel(channel.id));
  }

  if (backupCompleted) {
    await backupUser();
    await backupPhoto(connection.brightId, filename);
  }
};
