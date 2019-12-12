// @flow

import * as React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import store from './store';
import { bootstrapAndUpgrade } from './versions';

export default class AppBootstrap extends React.Component<Props> {
  componentDidMount() {
    this.bootstrap();
  }

  updateStorage = async () => {
    // update user data
    // let userData = await AsyncStorage.getItem('userData');
    // userData = JSON.parse(userData);
    // userData.id = b64ToUrlSafeB64(userData.publicKey);
    // delete userData.safePubKey;
    // // await AsyncStorage.setItem('userData', JSON.stringify(userData));
    // // update connections data
    // // const allKeys = await AsyncStorage.getAllKeys();
    // const varsKeys = [
    //   'userData',
    //   'backupCompleted',
    //   'recoveryData',
    //   'password',
    // ];
    // const connectionKeys = allKeys.filter(
    //   (val) => !varsKeys.includes(val) && !val.startsWith('App:'),
    // );
    // const storageValues = await AsyncStorage.multiGet(connectionKeys);
    // const connections = storageValues.map((val) => JSON.parse(val[1]));
    // for (let conn of connections) {
    //   conn.id = conn.publicKey;
    //   delete conn.publicKey;
    //   await AsyncStorage.setItem(conn.id, JSON.stringify(conn));
    // }
  };

  // Fetch the token from storage then navigate to our appropriate place
  bootstrap = async () => {
    try {
      // load redux store from async storage and upgrade async storage is necessary
      await bootstrapAndUpgrade();
      const { publicKey } = store.getState();
      // once everything is set up
      this.props.navigation.navigate(publicKey ? 'App' : 'Onboarding');
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
