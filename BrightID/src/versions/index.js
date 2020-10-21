// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { setGroups, setInvites } from '@/actions';
import store from '@/store';
import { bootstrapV0, getConnections, getApps, upgradeConnsAndIds } from './v0';
import { bootstrap } from './v4';

export const bootstrapAndUpgrade = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    console.log(allKeys);
    const v1 = isV1(allKeys);
    const v4 = isV4(allKeys);
    if (v4) {
      await bootstrap('store@v4');
    } else if (v1) {
      await bootstrap('store@v1');
    } else if (!v1) {
      await bootstrapV0();
      await getConnections(allKeys);
      await getApps(allKeys);
      store.dispatch(setGroups([]));
      store.dispatch(setInvites([]));
      upgradeConnsAndIds();
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};

export const isV1 = (allKeys: string[]) => allKeys.includes('store@v1');
export const isV4 = (allKeys: string[]) => allKeys.includes('store@v4');
