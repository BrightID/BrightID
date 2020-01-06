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
