// @flow

import { AsyncStorage } from 'react-native';
import nacl from 'tweetnacl';
import emitter from '../../../emitter';
import { savePhoto } from '../../../utils/filesystem';
import { b64ToUrlSafeB64, strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';
import { encryptAndUploadLocalData } from './encryptData';
import api from '../../../Api/BrightId';

export const addNewConnection = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  /**
   * Add connection in async storage  &&
   * Clear the redux store of all leftoverwebrtc data
   */
  try {
    const { connectUserData, publicKey, secretKey } = getState().main;
    let connectionDate = Date.now();
    if (connectUserData.signedMessage) {
      // The other user signed a connection request; we have enough info to
      // make an API call to create the connection.

      const message =
        connectUserData.publicKey +
        publicKey +
        connectUserData.timestamp;
      const signedMessage = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );
      let result = await api.createConnection(
        connectUserData.publicKey,
        connectUserData.signedMessage,
        publicKey,
        signedMessage,
        connectUserData.timestamp,
      );
      console.log(result);
    } else {
      // We will sign a connection request and upload it. The other user will
      // make the API call to create the connection.

      dispatch(encryptAndUploadLocalData());
    }
    // We store publicKeys as url-safe base-64.
    const connectUserSafePubKey = b64ToUrlSafeB64(connectUserData.publicKey);

    const filename = await savePhoto({
      safePubKey: connectUserSafePubKey,
      base64Image: connectUserData.photo,
    });
    // TODO formalize spec for this
    // create a new connection object

    // TODO: call to backend to get all connections scores, then update all of them
    // A score from a node is reliable, whereas a score from a direct connection may not be.
    // Also, scores may become stale. When a new connection is made, it's a good time to
    // update all scores.

    const connectionData = {
      publicKey: connectUserSafePubKey,
      name: connectUserData.name,
      score: connectUserData.score,
      connectionDate,
      photo: { filename },
    };

    // add connection inside of async storage
    await AsyncStorage.setItem(
      connectUserSafePubKey,
      JSON.stringify(connectionData),
    );

    emitter.emit('refreshConnections', {});
  } catch (err) {
    console.log(err);
  }
};
