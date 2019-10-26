// @flow
import { Alert, AsyncStorage } from 'react-native';
import {
  setTrustedConnections,
  setBackupCompleted
} from './index';
import api from '../Api/BrightId';

export const toggleTrustedConnection = (publicKey: string) => (
  dispatch: dispatch,
  getState: getState,
) => {
  let trustedConnections = [...getState().main.trustedConnections];
  const index = trustedConnections.indexOf(publicKey);
  if (index >= 0) {
    trustedConnections.splice(index, 1);
  } else {
    trustedConnections.push(publicKey);
  }
  dispatch(setTrustedConnections(trustedConnections));
};

export const saveTrustedConnections = (navigation) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let { trustedConnections } = getState().main;
  if (trustedConnections.length < 3) {
    Alert.alert(
      'Cannot save trusted connections.',
      'You need at least three trusted connections for backup.',
    );
    return false;
  }
  try {
    // await api.saveTrustedConnections(trustedConnections);
    await AsyncStorage.setItem('backupCompleted', 'true');
    dispatch(setBackupCompleted(true));
    Alert.alert(
      'Info',
      'Trusted connections saved successfully!',
      [
        {text: 'OK', onPress: () => navigation.navigate('Home')},
      ],
    );
  } catch (err) {
    Alert.alert('Cannot save trusted connections', err.message);
    return false;
  }
};
