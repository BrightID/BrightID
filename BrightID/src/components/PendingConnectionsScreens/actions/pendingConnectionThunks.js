// @flow
import {
  channel_types,
  selectChannelById,
} from '@/components/PendingConnectionsScreens/channelSlice';
import { obtainKeys } from '@/utils/keychain';
import { hash } from '@/utils/encoding';
import { addConnection, addOperation } from '@/actions';
import { saveImage } from '@/utils/filesystem';
import { backupPhoto, backupUser } from '@/components/Recovery/helpers';
import {
  confirmPendingConnection,
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { leaveChannel } from '@/components/PendingConnectionsScreens/actions/channelThunks';
import {
  initiateConnectionRequest,
  respondToConnectionRequest,
} from '../../../utils/connections';
import { DEFAULT_OP_TRACE_TIME } from '../../../utils/constants';

export const confirmPendingConnectionThunk = (id: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  const pendingConnection: PendingConnection = selectPendingConnectionById(
    getState(),
    id,
  );

  if (!pendingConnection) {
    throw new Error(`Can't confirm - pendingConnection ${id} not found`);
  }

  // validate pendingConnection state
  if (pendingConnection.state !== pendingConnection_states.UNCONFIRMED) {
    console.log(
      `Can't confirm - PendingConnection is in state ${pendingConnection.state}`,
    );
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

  const channel: Channel = selectChannelById(
    getState(),
    pendingConnection.channelId,
  );
  console.log(`confirming connection ${id} in channel ${channel.id}`);

  const {
    user: { backupCompleted },
  } = getState();

  let { username: myBrightId, secretKey } = await obtainKeys();
  let connectionTimestamp = Date.now();

  if (pendingConnection.initiator) {
    const { opName, opMessage } = await initiateConnectionRequest({
      myBrightId,
      secretKey,
      channel,
      connection: pendingConnection,
      connectionTimestamp,
    });

    // Start listening for peer to complete connection operation.
    // Set op tracetime to remaining channel lifetime + default tracetime as buffer
    const tracetime =
      channel.timestamp + channel.ttl + DEFAULT_OP_TRACE_TIME - Date.now();
    const apiVersion = 5;
    const watchOp = {
      hash: hash(opMessage),
      name: opName,
      timestamp: connectionTimestamp,
      v: apiVersion,
      tracetime,
    };
    dispatch(addOperation(watchOp));
  } else {
    if (pendingConnection.signedMessage) {
      // signedmessage from initiator is already available. Can respond immediately.
      await respondToConnectionRequest({
        otherBrightId: pendingConnection.brightId,
        signedMessage: pendingConnection.signedMessage,
        timestamp: pendingConnection.timestamp,
        myBrightId,
        secretKey,
      });
      if (channel.type === channel_types.SINGLE) {
        // Connection is established, so the 1:1 channel can be left
        dispatch(leaveChannel(channel.id));
      }
    } else {
      // signedMessage from initiator is still pending.
      // Remember that I want to confirm this pendingConnection. As soon as
      // the connectionRequest with signedMessage comes in, connection operation will be created.
      dispatch(
        updatePendingConnection({
          id,
          changes: {
            preConfirmed: true,
          },
        }),
      );
    }
  }

  // save connection photo
  const filename = await saveImage({
    imageName: pendingConnection.brightId,
    base64Image: pendingConnection.photo,
  });

  // create established connection from pendingConnection
  const connectionData = {
    id: pendingConnection.brightId,
    name: pendingConnection.name,
    score: pendingConnection.score,
    connectionDate: connectionTimestamp,
    photo: { filename },
    status: 'initiated',
    notificationToken: pendingConnection.notificationToken,
    secretKey: pendingConnection.secretKey,
  };

  dispatch(addConnection(connectionData));
  dispatch(confirmPendingConnection(pendingConnection.id));

  if (backupCompleted) {
    await backupUser();
    await backupPhoto(pendingConnection.brightId, filename);
  }
};
