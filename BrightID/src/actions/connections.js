// @flow
import { AsyncStorage } from 'react-native';
import api from '../Api/BrightId';
import { setConnections } from './index';
import { defaultSort } from '../components/Connections/sortingUtility';
import store from '../store';

export const getConnections = () => async (dispatch: dispatch) => {
  try {
    /**
     * obtain connection keys from async storage
     * currently everything in async storage is a connection except
     *    'userData', 'backupCompleted', 'recoveryKeys', 'password'
     *    apps (which have keys starting with "App:")
     */

    const allKeys = await AsyncStorage.getAllKeys();
    const varsKeys = ['userData', 'backupCompleted', 'recoveryKeys', 'password']
    const connectionKeys = allKeys.filter(val => !varsKeys.includes(val) && !val.startsWith('App:'));
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map(val => JSON.parse(val[1]));

    // update redux store
    dispatch(setConnections(connections));
    dispatch(defaultSort())
    updateConnections(connections).then(() => dispatch(defaultSort()));
  } catch (err) {
    console.warn(err);
  }
};

const updateConnections = async (localConnections) => {
  const { publicKey, secretKey } = store.getState().main;
  const { connections } = await api.getUserInfo(publicKey, secretKey);
  const remoteConnections = new Map(connections.map(conn => [conn.key, conn]));
  await updateRecoveredConnections(remoteConnections);
  await updateScores(localConnections, remoteConnections);
};

const updateScores = async (localConnections, remoteConnections) => {
  for (let conn of localConnections) {
    let remoteConn = remoteConnections.get(conn.publicKey);
    if (remoteConn) {
      conn.score = remoteConn.score ;
      AsyncStorage.setItem(conn.publicKey, JSON.stringify(conn));
    } else {
      console.warn(conn.publicKey, 'not found in remote connections!');
    }
  }
};

export const updateRecoveredConnections = async (remoteConnections) => {
  const localKeys = await AsyncStorage.getAllKeys();
  const remoteKeys = [ ...remoteConnections.keys() ];
  const difference = remoteKeys.filter(key => !localKeys.includes(key));
  for (let key of difference) {
    const oldKeys = remoteConnections.get(key).oldKeys;
    if (!oldKeys) {
      return console.warn('Unknow case! There is no oldKeys on the remote connection.');
    }
    const oldKey = oldKeys[oldKeys.length - 1];
    if (!localKeys.includes(oldKey)) {
      return console.warn('Unknow case! Old key is not found in local keys.');
    }
    let connStr = await AsyncStorage.getItem(oldKey);
    const conn = JSON.parse(connStr);
    conn.publicKey = key;
    await saveConnection(conn);
    await AsyncStorage.removeItem(oldKey);
    console.warn(key, 'replaced', oldKey, 'with', connStr);
  }
};

export const saveConnection = async (connectionData: connection) => {
  // add connection inside of async storage
  await AsyncStorage.setItem(
    connectionData.publicKey,
    JSON.stringify(connectionData),
  );
};
