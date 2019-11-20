// @flow
import { AsyncStorage } from 'react-native';
import api from '../Api/BrightId';
import { setConnections } from './index';
import { defaultSort } from '../components/Connections/sortingUtility';

export const getConnections = () => async (dispatch: dispatch) => {
  try {
    /**
     * obtain connection ids from async storage
     * currently everything in async storage is a connection except
     *    'userData', 'backupCompleted', 'recoveryKeys', 'password'
     *    apps (which have keys starting with "App:")
     */

    const allKeys = await AsyncStorage.getAllKeys();
    const varsKeys = ['userData', 'backupCompleted', 'recoveryKeys', 'password'];
    const connectionKeys = allKeys.filter(val => !varsKeys.includes(val) && !val.startsWith('App:'));
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map(val => JSON.parse(val[1]));

    // update redux store
    dispatch(setConnections(connections));
    dispatch(defaultSort())
    updateScores(connections).then(() => dispatch(defaultSort()));
  } catch (err) {
    console.warn(err);
  }
};

const updateScores = async (localConnections) => {
  const userInfo = await api.getUserInfo();
  const remoteConnections = new Map(userInfo.connections.map(conn => [conn.id, conn]));
  
  for (let conn of localConnections) {
    let remoteConn = remoteConnections.get(conn.id);
    if (remoteConn && conn.score != remoteConn.score) {
      conn.score = remoteConn.score ;
      AsyncStorage.setItem(conn.id, JSON.stringify(conn));
    } else if (!remoteConn) {
      console.warn(conn.id, 'not found in remote connections!');
    }
  }
};

export const saveConnection = async (connectionData: connection) => {
  // add connection inside of async storage
  await AsyncStorage.setItem(
    connectionData.id,
    JSON.stringify(connectionData),
  );
};
