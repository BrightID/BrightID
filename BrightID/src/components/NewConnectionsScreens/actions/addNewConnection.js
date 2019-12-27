// @flow

import nacl from 'tweetnacl';
import { AsyncStorage } from 'react-native';
import { createCipher } from 'react-native-crypto';
import emitter from '../../../emitter';
import { saveImage } from '../../../utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';
import { encryptAndUploadLocalData } from './encryptData';
import api from '../../../Api/BrightId';
import { saveConnection } from '../../../actions/connections';
import backupApi from '../../../Api/BackupApi';

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
      connectUserData,
      id,
      secretKey,
      backupCompleted,
      name,
      score,
      connections,
    } = getState().main;
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

    // first backup the connection because if we save the connection first
    // and then we get an error in saving the backup, user will not solve
    // the issue by making the connection again.
    if (backupCompleted) {
      const password = await AsyncStorage.getItem('password');
      let cipher = createCipher('aes128', password);
      let encrypted =
        cipher.update(connectUserData.photo, 'utf8', 'base64') +
        cipher.final('base64');
      await backupApi.set(id, connectUserData.id, encrypted);
      const userData = { id, name, score };
      const tmp = [...connections, connectionData];
      const dataStr = JSON.stringify({ userData, connections: tmp });
      cipher = createCipher('aes128', password);
      encrypted =
        cipher.update(dataStr, 'utf8', 'base64') + cipher.final('base64');
      await backupApi.set(id, 'data', encrypted);
      console.log('new connection backup completed!');
    }

    // add connection inside of async storage
    await saveConnection(connectionData);

    emitter.emit('refreshConnections', {});
  } catch (err) {
    console.log(err);
  }
};
