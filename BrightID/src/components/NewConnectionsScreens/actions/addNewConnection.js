// @flow

import nacl from 'tweetnacl';
import { saveImage } from '@/utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { obtainKeys } from '@/utils/keychain';
import api from '@/api/node';
import { addConnection, addOperation } from '@/actions';
import { backupPhoto, backupUser } from '../../Recovery/helpers';
import { encryptAndUploadProfile } from './profile';

const TIME_FUDGE = 60 * 60 * 1000; // timestamp can be this far in the future (milliseconds) to accommodate 2 clients clock differences

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

    // we don't care if this fails right now
    // if we remove polling, we need to make sure this works
    notificationService.sendNotification({
      notificationToken: connectUserData.notificationToken,
      type:
        connectUserData.qrData.user === '2'
          ? 'CONNECTION_REQUEST'
          : 'CONNECTION_ACCEPTED',
      payload: {
        uuid: connectUserData.qrData.uuid,
      },
    });
    // first backup the connection because if we save the connection first
    // and then we get an error in saving the backup, user will not solve
    // the issue by making the connection again.
  } catch (err) {
    console.log(err);
  }
};
