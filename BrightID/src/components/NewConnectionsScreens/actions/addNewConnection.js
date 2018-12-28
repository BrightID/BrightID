// @flow

import { AsyncStorage } from 'react-native';
import nacl from 'tweetnacl';
import emitter from '../../../emitter';
import { saveAvatar } from '../../../utils/filesystem';
import { strToUint8Array, uInt8ArrayToB64 } from '../../../utils/encoding';
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
        uInt8ArrayToB64(connectUserData.publicKey) +
        uInt8ArrayToB64(publicKey) +
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
    const uri = await saveAvatar({
      publicKey: connectUserData.publicKey,
      base64Image: connectUserData.avatar,
    });
    // TODO formalize spec for this
    // create a new connection object
    const connectionData = {
      publicKey: connectUserData.publicKey,
      nameornym: connectUserData.nameornym,
      trustScore: connectUserData.trustScore,
      secretKey: connectUserData.secretKey || '',
      connectionDate,
      avatar: { uri: `file://${uri}` },
    };

    // add connection inside of async storage
    await AsyncStorage.setItem(
      JSON.stringify(connectUserData.publicKey),
      JSON.stringify(connectionData),
    );

    emitter.emit('refreshConnections', {});
  } catch (err) {
    console.log(err);
  }
};
