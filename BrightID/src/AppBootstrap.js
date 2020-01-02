// @flow

import * as React from 'react';
import { AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import store from './store';
import { objToUint8, b64ToUrlSafeB64 } from './utils/encoding';
import { setUserData, setBackupCompleted } from './actions';
import fetchUserInfo from './actions/fetchUserInfo';
import { getNotifications } from './actions/notifications';

export default class AppBootstrap extends React.Component<Props> {
  componentDidMount() {
    this.bootstrapAsync();
  }

  updateStorage = async () => {
    // update user data
    let userData = await AsyncStorage.getItem('userData');
    userData = JSON.parse(userData);
    userData.id = b64ToUrlSafeB64(userData.publicKey);
    delete userData.safePubKey;
    await AsyncStorage.setItem('userData', JSON.stringify(userData));

    // update connections data
    const allKeys = await AsyncStorage.getAllKeys();
    const varsKeys = [
      'userData',
      'backupCompleted',
      'recoveryData',
      'password',
    ];
    const connectionKeys = allKeys.filter(
      (val) => !varsKeys.includes(val) && !val.startsWith('App:'),
    );
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map((val) => JSON.parse(val[1]));
    for (let conn of connections) {
      conn.id = conn.publicKey;
      delete conn.publicKey;
      await AsyncStorage.setItem(conn.id, JSON.stringify(conn));
    }
  };

  // Fetch the token from storage then navigate to our appropriate place
  bootstrapAsync = async () => {
    try {
      // load user data from async storage
      let userData = await AsyncStorage.getItem('userData');
      if (userData !== null) {
        userData = JSON.parse(userData);
        // convert private key to uInt8Array
        userData.secretKey = objToUint8(userData.secretKey);
        // update redux store
        await store.dispatch(setUserData(userData));

        // if there is no id in userData, it's first run of the new version
        // we should update data of user and connections in storage
        if (!userData.id) {
          await this.updateStorage();
        }

        const backupCompleted = await AsyncStorage.getItem('backupCompleted');
        await store.dispatch(setBackupCompleted(backupCompleted == 'true'));
        store.dispatch(fetchUserInfo()).then(() => {
          // getNotifications uses the user score so it should be called after fetchUserInfo
          // getNotifications uses backupCompleted so it should be called after setBackupCompleted
          store.dispatch(getNotifications());
        });
      }
      // once everything is set up
      this.props.navigation.navigate(userData ? 'App' : 'Onboarding');
    } catch (err) {
      console.log(err);
    }
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <Spinner isVisible={true} size={47} type="9CubeGrid" color="#4990e2" />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
