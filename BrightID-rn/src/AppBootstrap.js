// @flow

import * as React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
// import { Font, Permissions } from 'expo';
import store from './store';
import { setupPPKeys, generatePPKeys } from './actions/ppKeys';
import { setUpDefault } from './actions/setUpDefault';

type Props = {
  navigation: { navigate: Function },
};

export default class AppBootstrap extends React.Component<Props> {
  componentDidMount() {
    this.bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  bootstrapAsync = async () => {
    // bootstrap the application
    // async storage key 'userData' : {
    // userToken: String,
    // nameornym: String,
    // avatarUri: String
    // }

    try {
      // add user permssions
      // const cam = await Permissions.getAsync(Permissions.CAMERA);
      // const camr = await Permissions.getAsync(Permissions.CAMERA_ROLL);
      // // console.warn(cam);
      // // console.warn(camr);
      // // load font
      // await Font.loadAsync({
      //   EurostileRegular: require('../assets/fonts/EurostileRegular.ttf'),
      //   'ApexNew-Book': require('../assets/fonts/ApexNew-Book.otf'),
      //   'ApexNew-Medium': require('../assets/fonts/ApexNew-Medium.otf'),
      //   'ApexNew-Light': require('../assets/fonts/ApexNew-Light.otf'),
      // });

      // load user data
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

    // This should check the async storage for the Public/private keys as well.
    // If they don't exist, it generates new ones using tweetnacl.js.

    // try {
    //   // Should use some kind of encrypted storage
    //   let ppKeys = await AsyncStorage.getItem('connectionPPKeys');

    //   if (ppKeys !== null) {
    //     ppKeys = JSON.parse(ppKeys);
    //     store.dispatch(setupPPKeys(ppKeys));
    //   } else {
    //     // Generate new PPKeys and exchange with server.
    //     store.dispatch(generatePPKeys());
    //   }
    // } catch (err) {
    //   console.error(err);
    // }
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
