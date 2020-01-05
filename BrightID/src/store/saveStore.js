// @flow

import AsyncStorage from '@react-native-community/async-storage';
// eslint-disable-next-line import/no-cycle
import store from './index';

export const saveStore = async () => {
  try {
    const data = JSON.stringify(store.getState());
    await AsyncStorage.setItem('store@v1', data);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
