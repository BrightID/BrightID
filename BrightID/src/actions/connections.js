// @flow
import { AsyncStorage } from 'react-native';
import api from '../Api/BrightId';
import { setConnections } from './index';
import { defaultSort } from '../components/Connections/sortingUtility';

export const getConnections = () => async (dispatch: dispatch) => {
  try {
    /**
     * obtain connection keys from async storage
     * currently everything in async storage is a connection except
     *    "userData"
     *    apps (which have keys starting with "App:")
     */

    const allKeys = await AsyncStorage.getAllKeys();
    const connectionKeys = allKeys.filter(val => val !== 'userData' && val !== 'backupCompleted' && val !== 'recoveryKeys' && !val.startsWith('App:'));
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map(val => JSON.parse(val[1]));
    // update redux store
    dispatch(setConnections(connections));
    dispatch(defaultSort());
    dispatch(updateScores(connections));

    // sort connections
  } catch (err) {
    console.log(err);
  }
};

export const updateScores = (connections: connection[]) => async (
  dispatch: dispatch,
) => {
  try {

    for (let user of connections) {
      user.score = await api.getUserScore(user.publicKey);
      await saveConnection(user);
    }

    dispatch(defaultSort());
  } catch (err) {
    console.log(err);
  }
};

export const saveConnection = async (connectionData: connection) => {
  // add connection inside of async storage
  await AsyncStorage.setItem(
    connectionData.publicKey,
    JSON.stringify(connectionData),
  );
};
