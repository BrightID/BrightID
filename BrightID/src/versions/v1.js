// @flow

import AsyncStorage from '@react-native-async-storage/async-storage';
import { hydrateStore } from '@/store/hydrateStore';

export const bootstrapV1 = hydrateStore('store@v1');

export const deleteV1 = async () => {
  await AsyncStorage.removeItem('store@v1');
};
