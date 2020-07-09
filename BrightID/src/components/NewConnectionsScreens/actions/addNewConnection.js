// @flow

import nacl from 'tweetnacl';
import { saveImage } from '@/utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { obtainKeys } from '@/utils/keychain';
import api from '@/Api/BrightId';
import { addConnection, addOperation } from '@/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  pendingConnection_states,
  removePendingConnection,
  selectPendingConnectionById,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { postConnectionRequest } from '@/utils/profile';
import { selectChannelById } from '@/components/NewConnectionsScreens/channelSlice';
import { backupPhoto, backupUser } from '../../Recovery/helpers';
import { encryptAndUploadProfile } from './profile';

const TIME_FUDGE = 60 * 60 * 1000; // timestamp can be this far in the future (milliseconds) to accommodate 2 clients clock differences

export const confirmPendingConnection = createAsyncThunk(
  'pendingConnections/confirmPendingConnection',
  async ({ channelId, profileId }, { getState, dispatch }) => {
    console.log(`confirming connection ${profileId} in channel ${channelId}`);
    const channel = selectChannelById(getState(), channelId);
    const connection: PendingConnection = selectPendingConnectionById(
      getState(),
      profileId,
    );
    const {
      user: { backupCompleted },
    } = getState();

    // validate profile state
    if (connection.state !== pendingConnection_states.COMPLETE) {
      console.log(`Can't confirm - Connection is in state ${connection.state}`);
      return;
    }

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
      await api.createConnection(
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
      await postConnectionRequest(
        data,
        channel.ipAddress,
        connection.id,
        channel.myProfileId,
      );

      // Listen for add connection operation to be completed by other party
      let opName = 'Add Connection';
      let opMessage =
        opName + username + connection.brightId + connectionTimestamp;
      console.log(
        `Responder opMessage: ${opMessage} - hash: ${hash(opMessage)}`,
      );
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

    // transfer connection from pendingConnections to established connections
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
    dispatch(removePendingConnection(connection.id));

    if (backupCompleted) {
      await backupUser();
      await backupPhoto(connection.brightId, filename);
    }
  },
);

export const addNewConnection = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  /**
   * Add connection in async storage  &&
   * Clear the redux store of all leftoverwebrtc data
   */
  try {
    const {
      user: { backupCompleted },
      connectUserData,
      connectQrData: { peerQrData },
    } = getState();
    let { username, secretKey } = await obtainKeys();
    let connectionDate = Date.now();

    if (connectUserData.signedMessage) {
      // The other user signed a connection request; we have enough info to
      // make an API call to create the connection.

      if (connectUserData.timestamp > connectionDate + TIME_FUDGE) {
        throw new Error("timestamp can't be in the future");
      }

      const message = `Add Connection${connectUserData.id}${username}${connectUserData.timestamp}`;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
      await api.createConnection(
        connectUserData.id,
        connectUserData.signedMessage,
        username,
        signedMessage,
        connectUserData.timestamp,
      );
    } else {
      // We will sign a connection request and upload it. The other user will
      // make the API call to create the connection.
      const timestamp = Date.now();
      const message = `Add Connection${username}${connectUserData.id}${timestamp}`;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
      dispatch(encryptAndUploadProfile(peerQrData, timestamp, signedMessage));

      // Listen for add connection operation to be completed by other party
      let opName = 'Add Connection';
      let opMessage = opName + username + connectUserData.id + timestamp;
      console.log(
        `Responder opMessage: ${opMessage} - hash: ${hash(opMessage)}`,
      );
      const op = {
        _key: hash(opMessage),
        name: opName,
        timestamp,
      };
      dispatch(addOperation(op));
    }

    const filename = await saveImage({
      imageName: connectUserData.id,
      base64Image: connectUserData.photo,
    });

    const connectionData = {
      id: connectUserData.id,
      name: connectUserData.name,
      score: connectUserData.score,
      secretKey: connectUserData.secretKey,
      aesKey: connectUserData.aesKey,
      connectionDate,
      photo: { filename },
      status: 'initiated',
    };

    dispatch(addConnection(connectionData));

    if (backupCompleted) {
      await backupUser();
      await backupPhoto(connectUserData.id, filename);
    }
    // first backup the connection because if we save the connection first
    // and then we get an error in saving the backup, user will not solve
    // the issue by making the connection again.
  } catch (err) {
    console.log(err);
  }
};
