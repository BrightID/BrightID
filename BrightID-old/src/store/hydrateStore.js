// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import store from './index';
import { objToUint8 } from '../utils/encoding';
import { hydrateState } from '../actions';

export const hydrateStore = async () => {
  try {
    const dataStr = await AsyncStorage.getItem('store@v1');
    if (dataStr !== null) {
      const dataObj = JSON.parse(dataStr);
      dataObj.secretKey = objToUint8(dataObj.secretKey);
      dataObj.searchParam = '';
      store.dispatch(hydrateState(dataObj));
    }
  } catch (err) {
    Alert.alert('Redux Store did not load properly');
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
