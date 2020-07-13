// @flow
import { selectChannelById } from '@/components/NewConnectionsScreens/channelSlice';
import { obtainKeys } from '@/utils/keychain';
import { TIME_FUDGE } from '@/utils/constants';
import { hash, strToUint8Array, uInt8ArrayToB64 } from '@/utils/encoding';
import nacl from 'tweetnacl';
import api from '@/Api/BrightId';
import { postConnectionRequest } from '@/utils/profile';
import { addConnection, addOperation } from '@/actions';
import { saveImage } from '@/utils/filesystem';
import { backupPhoto, backupUser } from '@/components/Recovery/helpers';
import {
  confirmPendingConnection,
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';

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
    user: { backupCompleted },
  } = getState();

  let { username, secretKey } = await obtainKeys();
  let connectionTimestamp = Date.now();

  if (connection.signedMessage) {
    // I'm responding
    // The other user signed a connection request; we have enough info to
    // make an API call to create the connection.
    if (connection.timestamp > connectionTimestamp + TIME_FUDGE) {
      throw new Error("timestamp can't be in the future");
    }

    const message = `Add Connection${connection.brightId}${username}${connection.timestamp}`;
    const signedMessage = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    api.createConnection(
      connection.brightId,
      connection.signedMessage,
      username,
      signedMessage,
      connection.timestamp,
    );
  } else {
    // I'm initiating
    const message = `Add Connection${username}${connection.brightId}${connectionTimestamp}`;
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
    postConnectionRequest(
      data,
      channel.ipAddress,
      connection.id,
      channel.myProfileId,
    );

    // Listen for add connection operation to be completed by other party
    let opName = 'Add Connection';
    let opMessage =
      opName + username + connection.brightId + connectionTimestamp;
    console.log(`Responder opMessage: ${opMessage} - hash: ${hash(opMessage)}`);
    const op = {
      _key: hash(opMessage),
      name: opName,
      connectionTimestamp,
    };
    dispatch(addOperation(op));
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
    // secretKey: connectUserData.secretKey,
    // aesKey: connectUserData.aesKey,
    connectionDate: connectionTimestamp,
    photo: { filename },
    status: 'initiated',
  };

  dispatch(addConnection(connectionData));
  dispatch(confirmPendingConnection(connection.id));

  if (backupCompleted) {
    await backupUser();
    await backupPhoto(connection.brightId, filename);
  }
};
