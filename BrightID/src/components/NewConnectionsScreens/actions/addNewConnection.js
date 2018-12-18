// @flow

import { AsyncStorage } from 'react-native';
import emitter from '../../../emitter';
import { saveAvatar } from '../../../utils/filesystem';
import { connectUsers } from './connectUsers';

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
    if (connectUserData.secretKey) {
      let userA = { publicKey, secretKey };
      let userB = connectUserData;
      connectionDate = await connectUsers(userA, userB);
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
