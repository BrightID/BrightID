// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
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
