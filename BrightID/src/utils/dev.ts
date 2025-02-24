import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'react-native-blob-util';
import { resetStore } from '@/actions';

const defaultStoragePath = `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`;

export const dangerouslyDeleteStorage = async (dispatch: AppDispatch) => {
  dispatch(resetStore());
  await AsyncStorage.clear();
  await RNFetchBlob.fs.unlink(defaultStoragePath);
};

export const delStorage = (dispatch: AppDispatch) => {
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
              await dangerouslyDeleteStorage(dispatch);
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
