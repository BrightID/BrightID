// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { saveStore } from '../store/saveStore';
import store from '../store';
import fetchUserInfo from '../actions/fetchUserInfo';
import {
  bootstrapV0,
  getConnections,
  getApps,
  verifyConnections,
  verifyApps,
  verifyUserData,
  upgradeIds,
} from './v0';
import { bootstrapV1 } from './v1';

export const bootstrapAndUpgrade = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(allKeys);
    const v1 = isV1(allKeys);
    if (v1) {
      await bootstrapV1();
      const { publicKey } = store.getState();
      if (publicKey) store.dispatch(fetchUserInfo());
    } else if (!v1) {
      await bootstrapV0();
      await getConnections(allKeys);
      await getApps(allKeys);
      const connectionsVerified = await verifyConnections(allKeys);
      const userDataVerified = await verifyUserData();
      const appsVerified = await verifyApps(allKeys);
      if (connectionsVerified && userDataVerified && appsVerified) {
        // save the redux store

        upgradeIds();
        const { publicKey } = store.getState();
        if (publicKey) store.dispatch(fetchUserInfo());
        await saveStore();
      } else {
        Alert.alert('Error: Please Backup Data and reinstall BrightId');
      }
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const isV1 = (allKeys: string[]) => allKeys.includes('store@v1');
