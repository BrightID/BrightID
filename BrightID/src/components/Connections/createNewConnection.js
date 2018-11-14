// @flow

import { Alert } from 'react-native';
import store from '../../store';
import { addConnection } from '../../actions/fakeContact';

export const createNewConnection = (navigation) => () => {
  Alert.alert(
    'New Connection',
    'Would you like simulate adding a new connection?',
    [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Sure',
        onPress: () => {
          store.dispatch(addConnection());
          navigation.navigate('PreviewConnection');
        },
      },
    ],
    { cancelable: true },
  );
};
