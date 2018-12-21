// @flow

import { AsyncStorage } from 'react-native';
import emitter from '../../../emitter';
import { saveAvatar } from '../../../utils/filesystem';
import { setUpWs } from './websocket';
import nacl from "tweetnacl";
import { strToUint8Array, obj2b64, objToUint8 } from '../../../utils/encoding';
import { encryptAndUploadLocalData } from './encryptData';
import api from '../../../Api/BrightIdApi';

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

      const message = connectUserData.publicKey + obj2b64(publicKey) + connectUserData.timestamp;
      const signedMessage = obj2b64(nacl.sign.detached(strToUint8Array(message), objToUint8(secretKey)));
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
