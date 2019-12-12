// @flow

import { Alert, AsyncStorage } from 'react-native';
// eslint-disable-next-line import/no-cycle
import store from './index';

export const saveStore = async () => {
  try {
    const data = JSON.stringify(store.getState());
    await AsyncStorage.setItem('store@v1', data);
  } catch (err) {
    Alert.alert('Redux Store did not save');
    console.log(err);
  }
};
