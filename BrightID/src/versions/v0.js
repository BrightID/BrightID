// @flow

import AsyncStorage from '@react-native-community/async-storage';
import { objToUint8 } from '../utils/encoding';
import { setUserData, setConnections, setApps } from '../actions';
import fetchUserInfo from '../actions/fetchUserInfo';
import { defaultSort } from '../components/Connections/sortingUtility';

import store from '../store';

export const bootstrapV0 = async (navigation: navigation) => {
  try {
    // load user data from async storage
    let userData = await AsyncStorage.getItem('userData');
    if (userData !== null) {
      userData = JSON.parse(userData);
      // convert private key to uInt8Array
      userData.secretKey = objToUint8(userData.secretKey);
      // update redux store
      await store.dispatch(setUserData(userData));
      store.dispatch(fetchUserInfo());
    }
  } catch (err) {
    console.log(err);
  }
};

export const getConnections = async (allKeys: string[]) => {
  try {
    /**
     * obtain connection keys from async storage
     * currently everything in async storage is a connection except
     *    "userData"
     *    apps (which have keys starting with "App:")
     */

    const connectionKeys = allKeys.filter(
      (val) =>
        val !== 'userData' &&
        !val.startsWith('App:') &&
        !val.startsWith('store'),
    );
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map((val) => JSON.parse(val[1]));
    // update redux store
    store.dispatch(setConnections(connections));
    store.dispatch(defaultSort());

    // sort connections
  } catch (err) {
    console.log(err);
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
    console.log(err);
  }
};

export const verifyConnections = async (allKeys: string[]) => {
  try {
    /**
     * obtain connection keys from async storage
     * currently everything in async storage is a connection except
     *    "userData"
     *    apps (which have keys starting with "App:")
     */

    const connectionKeys = allKeys
      .filter(
        (val) =>
          val !== 'userData' &&
          !val.startsWith('App:') &&
          !val.startsWith('store'),
      )
      .sort();

    const reduxConnectionKeys = store
      .getState()
      .connections.map(({ publicKey }) => publicKey)
      .sort();

    return (
      JSON.stringify(connectionKeys) === JSON.stringify(reduxConnectionKeys)
    );
  } catch (err) {
    console.log(err);
  }
};

export const verifyApps = async (allKeys: string[]) => {
  try {
    const appKeys = allKeys.filter((key) => key.startsWith('App:'));
    const appValues = await AsyncStorage.multiGet(appKeys);
    // see https://facebook.github.io/react-native/docs/asyncstorage#multiget
    const appInfos = appValues
      .map((val) => JSON.parse(val[1]))
      .sort((a, b) => b.dateAdded - a.dateAdded);

    const { apps } = store.getState();

    return JSON.stringify(appInfos) === JSON.stringify(apps);
  } catch (err) {
    console.log(err);
  }
};

export const verifyUserData = async () => {
  try {
    let userData = await AsyncStorage.getItem('userData');
    if (userData !== null) {
      userData = JSON.parse(userData);
      let { publicKey, secretKey, name, photo } = store.getState();

      return (
        JSON.stringify(userData.publicKey) === JSON.stringify(publicKey) &&
        JSON.stringify(userData.secretKey) === JSON.stringify(secretKey) &&
        JSON.stringify(userData.name) === JSON.stringify(name) &&
        JSON.stringify(userData.photo) === JSON.stringify(photo)
      );
    }
  } catch (err) {
    console.log(err);
  }
};

export const isV0 = (allKeys: string[]) => {
  return !allKeys.includes('version');
};
