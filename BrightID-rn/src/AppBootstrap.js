// @flow

import * as React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import store from './store';
import { setUpDefault } from './actions/setUpDefault';

export default class AppBootstrap extends React.Component {
  constructor(props) {
    super(props);
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    // bootstrap the application
    // async storage key 'userData' : {
    //	userToken: String,
    //  nameornym: String,
    //  avatarUri: String
    //	}
    try {
      let userData = await AsyncStorage.getItem('userData');
      if (userData !== null) {
        userData = JSON.parse(userData);
        store.dispatch(setUpDefault(userData));
      } else {
        store.dispatch(setUpDefault({}));
      }
      this.props.navigation.navigate(userData ? 'App' : 'Onboarding');
    } catch (err) {
      console.warn(err);
    }
  };

  // Render any loading content that you like here
  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
