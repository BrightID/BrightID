// @flow

import AsyncStorage from '@react-native-community/async-storage';

export const saveStore = async (state) => {
  try {
    const data = JSON.stringify(state);
    await AsyncStorage.setItem('store@v1', data);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
