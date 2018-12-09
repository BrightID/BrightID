// @flow

import { AsyncStorage } from 'react-native';
import { removeConnectUserData } from '../../../actions';
import emitter from '../../../emitter';
import { saveAvatar } from '../../../utils/filesystem';

export const addNewConnection = () => async (
  dispatch: () => null,
  getState: () => {},
) => {
  /**
   * Add connection in async storage  &&
   * Clear the redux store of all leftoverwebrtc data
   */
  try {
    const {
      connectUserData: { avatar, nameornym, publicKey, trustScore },
    } = getState().main;
    // TODO formalize spec for this
    // create a new connection object
    const connectionData = {
      publicKey,
      nameornym,
      trustScore,
      connectionDate: Date.now(),
    };
    if (avatar) {
      const uri = await saveAvatar({ publicKey, base64Image: avatar });
      connectionData.avatar = { uri: `file://${uri}` };
    } else {
      connectionData.avatar = { uri: 'https://loremflickr.com/180/180/all' };
    }

    // add connection inside of async storage
    await AsyncStorage.setItem(
      JSON.stringify(publicKey),
      JSON.stringify(connectionData),
    );

    emitter.emit('refreshConnections', {});
  } catch (err) {
    console.log(err);
  }
};
