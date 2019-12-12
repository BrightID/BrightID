// @flow

import { AsyncStorage } from 'react-native';
import { hydrateStore } from '../store/hydrateStore';

export const bootstrapV1 = hydrateStore;

export const isV1 = async (allKeys: string[]) => {
  if (allKeys.includes('store@v1')) {
    const version = await AsyncStorage.getItem('version');
    return version === 'v1';
  }
};
