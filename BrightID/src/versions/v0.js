// @flow

import AsyncStorage from '@react-native-community/async-storage';
import { b64ToUrlSafeB64, objToUint8, uInt8ArrayToB64 } from '@/utils/encoding';
import {
  setUserData,
  setConnections,
  setApps,
  removeSafePubKey,
  setKeypair,
} from '@/actions';
import { defaultSort } from '@/components/Connections/models/sortingUtility';
import store from '@/store';

export const bootstrapV0 = async (navigation: navigation) => {
  try {
    // load user data from async storage
    let userData = await AsyncStorage.getItem('userData');

    if (userData !== null) {
      userData = JSON.parse(userData);
      // convert private key to uInt8Array
      if (typeof userData.publicKey === 'object') {
        userData.publicKey = uInt8ArrayToB64(objToUint8(userData.publicKey));
      }
      if (!userData.id) {
        userData.id = b64ToUrlSafeB64(userData.publicKey);
      }

      userData.secretKey = objToUint8(userData.secretKey);
      store.dispatch(setKeypair(userData.publicKey, userData.secretKey));

      // update redux store
      await store.dispatch(setUserData(userData));
    } else {
      throw new Error('unable to recover user data');
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
    throw new Error('unable to recover user data');
  }
};

export const getConnections = async (allKeys: string[]) => {
  try {
    const connectionKeys = allKeys.filter(
      (val) =>
        val !== 'userData' &&
        !val.startsWith('App:') &&
        !val.startsWith('store'),
    );
    console.log('connectionKeys', connectionKeys);
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map((val) => JSON.parse(val[1]));
    // update redux store
    store.dispatch(setConnections(connections));
    store.dispatch(defaultSort());

    // sort connections
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
    throw new Error('unable to recover connections');
  }
};

export const getApps = async (allKeys: string[]) => {
  try {
    const appKeys = allKeys.filter((key) => key.startsWith('App:'));
    const appValues = await AsyncStorage.multiGet(appKeys);
    // see https://facebook.github.io/react-native/docs/asyncstorage#multiget
    const appInfos = appValues
      .map((val) => JSON.parse(val[1]))
      .sort((a, b) => b.dateAdded - a.dateAdded);

    store.dispatch(setApps(appInfos));
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
    throw new Error('unable to recover apps');
  }
};

export const upgradeConnsAndIds = () => {
  const { connections } = store.getState().connections;

  const nextConn = connections.map((conn) => {
    if (conn.publicKey) {
      conn.id = b64ToUrlSafeB64(conn.publicKey);
      conn.status = 'verified';
    }
    return conn;
  });
  store.dispatch(setConnections(nextConn));
  store.dispatch(removeSafePubKey());
};
