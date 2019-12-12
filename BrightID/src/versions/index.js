// @flow

import { AsyncStorage, Alert } from 'react-native';
import { saveStore } from '../store/saveStore';
import {
  bootstrapV0,
  getConnections,
  getApps,
  verifyConnections,
  verifyApps,
  verifyUserData,
  isV0,
} from './v0';
import { bootstrapV1, isV1 } from './v1';

export const bootstrapAndUpgrade = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(allKeys);
    const v0 = isV0(allKeys);
    const v1 = await isV1(allKeys);
    if (v0) {
      await bootstrapV0();
      await getConnections();
      await getApps();
      const connectionsVerified = await verifyConnections();
      const userDataVerified = await verifyUserData();
      const appsVerified = await verifyApps();
      if (connectionsVerified && userDataVerified && appsVerified) {
        // delete the database
        await delStorage();
        // save the redux store
        await saveStore();
        await setVersion('v1');
      } else {
        Alert.alert('Error: Please Backup Data and reinstall BrightId');
      }
    } else if (v1) {
      await bootstrapV1();
    } else {
      // delete the database
      await delStorage();
      // set version 1
      await setVersion('v1');
    }
  } catch (err) {
    // reload app
    console.log(err);
  }
};

const delStorage = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();

    await AsyncStorage.multiRemove(allKeys);
  } catch (err) {
    throw err;
  }
};

const setVersion = async (version: string) => {
  try {
    await AsyncStorage.setItem('version', version);
  } catch (err) {
    throw err;
  }
};
