// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { setGroups, setInvites } from '@/actions';
import { saveStore } from '@/store/saveStore';
import { verifyStore } from '@/store/verifyStore';
import store from '@/store';
import {
  bootstrapV0,
  getConnections,
  getApps,
  verifyConnections,
  verifyApps,
  verifyUserData,
  upgradeConnsAndIdsAndGroups,
} from './v0';
import { bootstrapV1, deleteV1 } from './v1';
import { bootstrapV4 } from './v4';

export const bootstrapAndUpgrade = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(allKeys);
    const v1 = isV1(allKeys);
    const v4 = isV4(allKeys);
    if (v4) {
      await bootstrapV4();
    } else if (v1) {
      await bootstrapV1();
      store.dispatch(setGroups([]));
      store.dispatch(setInvites([]));
      const state = store.getState();
      delete state.eligibleGroups;
      delete state.currentGroups;
      if (verifyStore(state)) {
        await saveStore(state);
        await deleteV1();
      }
    } else if (!v1) {
      await bootstrapV0();
      await getConnections(allKeys);
      await getApps(allKeys);
      const connectionsVerified = await verifyConnections(allKeys);
      const userDataVerified = await verifyUserData();
      const appsVerified = await verifyApps(allKeys);
      if (connectionsVerified && userDataVerified && appsVerified) {
        // update connections / user to new Api
        upgradeConnsAndIdsAndGroups();
        store.dispatch(setGroups([]));
        store.dispatch(setInvites([]));
        const state = store.getState();
        delete state.eligibleGroups;
        delete state.currentGroups;
        if (verifyStore(state)) {
          await saveStore(state);
        }
      } else {
        Alert.alert('Error: Please Backup Data and reinstall BrightId');
      }
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const isV1 = (allKeys: string[]) => allKeys.includes('store@v1');
export const isV4 = (allKeys: string[]) => allKeys.includes('store@v4');
