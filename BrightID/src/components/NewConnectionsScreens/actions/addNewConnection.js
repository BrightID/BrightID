// @flow

import nacl from 'tweetnacl';
import { saveImage } from '../../../utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';
import { encryptAndUploadLocalData } from './encryptData';
import api from '../../../Api/BrightId';
import { backupPhoto, backupUser } from '../../Recovery/helpers';
import { addConnection } from '../../../actions';

export const addNewConnection = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  /**
   * Add connection in async storage  &&
   * Clear the redux store of all leftoverwebrtc data
   */
  try {
    const { connectUserData, id, secretKey, backupCompleted } = getState();
    let connectionDate = Date.now();

    if (connectUserData.signedMessage) {
      // The other user signed a connection request; we have enough info to
      // make an API call to create the connection.

      const message = connectUserData.id + id + connectUserData.timestamp;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
      await api.createConnection(
        connectUserData.id,
        connectUserData.signedMessage,
        id,
        signedMessage,
        connectUserData.timestamp,
      );
    } else {
      // We will sign a connection request and upload it. The other user will
      // make the API call to create the connection.

      dispatch(encryptAndUploadLocalData());
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
      connectionDate,
      photo: { filename },
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
