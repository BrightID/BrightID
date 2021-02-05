// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetStore } from '@/actions';
import { store } from '@/store';
import RNFetchBlob from 'rn-fetch-blob';

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

export const dangerouslyDeleteStorage = async () => {
  store.dispatch(resetStore());
  await AsyncStorage.flushGetRequests();
  await AsyncStorage.clear();
  await RNFetchBlob.fs.unlink(defaultStoragePath);
};

export const delStorage = () => {
  if (__DEV__) {
    Alert.alert(
      'WARNING',
      'Would you like to delete user data and return to the onboarding screen?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Sure',
          onPress: async () => {
            try {
              await dangerouslyDeleteStorage();
            } catch (err) {
              err instanceof Error
                ? console.warn('delete storage', err.message)
                : console.log('delete storage', err);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }
};
