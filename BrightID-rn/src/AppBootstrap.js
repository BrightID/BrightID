// @flow

import * as React from 'react';
import { AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import store from './store';
import { setUpDefault } from './actions/setUpDefault';
import { objToUint8 } from './utils/encoding';

type Props = {
  navigation: { navigate: () => null },
};

export default class AppBootstrap extends React.Component<Props> {
  componentDidMount() {
    this.bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  bootstrapAsync = async () => {
    try {
      // load user data from async storage
      let userData = await AsyncStorage.getItem('userData');
      if (userData !== null) {
        userData = JSON.parse(userData);
        // convert public / secret keys to Uint8Array
        userData.publicKey = objToUint8(userData.publicKey);
        userData.secretKey = objToUint8(userData.secretKey);
        // update redux store
        await store.dispatch(setUpDefault(userData));
      } else {
        await store.dispatch(setUpDefault({}));
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
        <Spinner
          style={styles.spinner}
          isVisible={true}
          size={47}
          type="9CubeGrid"
          color="#4990e2"
        />
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
