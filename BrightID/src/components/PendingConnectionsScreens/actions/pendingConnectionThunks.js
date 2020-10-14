// @flow
import {
  channel_types,
  selectChannelById,
} from '@/components/PendingConnectionsScreens/channelSlice';
import { TIME_FUDGE } from '@/utils/constants';
import { hash, strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import nacl from 'tweetnacl';
import api from '@/api/brightId';
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
import stringify from 'fast-json-stable-stringify';

export const confirmPendingConnectionThunk = (id: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
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
  console.log(`confirming connection ${id} in channel ${channel.id}`);

  const {
    user: { id: brightid, backupCompleted },
    keypair: { secretKey },
  } = getState();

  let connectionTimestamp = Date.now();

  if (connection.signedMessage) {
    // I'm responding
    // The other user signed a connection request; we have enough info to
    // make an API call to create the connection.
    if (connection.timestamp > connectionTimestamp + TIME_FUDGE) {
      throw new Error("timestamp can't be in the future");
    }

    const message = `Add Connection${connection.brightId}${brightid}${connection.timestamp}`;
    const signedMessage = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    api.createConnection(
      connection.brightId,
      connection.signedMessage,
      brightid,
      signedMessage,
      connection.timestamp,
    );
  } else {
    // I'm initiating
    const message = `Add Connection${brightid}${connection.brightId}${connectionTimestamp}`;
    const signedMessage = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    // bring signedmessage to peer so he knows i want to connect with him...
    console.log(
      `Uploading signed connection string for ${connection.name} to channel ${connection.id}`,
    );
    const data = {
      signedMessage,
      connectionTimestamp,
    };

    await channel.api.upload({
      channelId: connection.id,
      data,
      dataId: channel.myProfileId,
    });

    // Listen for add connection operation to be completed by other party
    const apiVersion = 5;
    const opName = 'Add Connection';
    const op = {
      name: opName,
      id1: brightid,
      id2: connection.brightId,
      timestamp: connectionTimestamp,
      v: apiVersion,
    };
    const opMessage = stringify(op);
    console.log(
      `Watching for responder opMessage: ${opMessage} - hash: ${hash(
        opMessage,
      )}`,
    );
    const watchOp = {
      hash: hash(opMessage),
      name: opName,
      timestamp: connectionTimestamp,
      v: apiVersion,
    };
    dispatch(addOperation(watchOp));
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
    score: connection.score,
    connectionDate: connectionTimestamp,
    photo: { filename },
    status: 'initiated',
    notificationToken: connection.notificationToken,
    secretKey: connection.secretKey,
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
