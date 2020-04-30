// @flow

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { navigate } from '@/NavigationService';
import { resetStore } from '@/actions';
import { store } from '@/store';

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
              store.dispatch(resetStore());
              navigate('Onboarding');
              await AsyncStorage.flushGetRequests();
              await AsyncStorage.clear();
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
