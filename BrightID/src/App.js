// @flow

import * as React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { bootstrapAndUpgrade } from './versions';
import { resetOperations } from './actions';
import fetchUserInfo from './actions/fetchUserInfo';
import { pollOperations } from './utils/operations';
import AppRoutes from './AppRoutes';
import { store, persistor } from './store';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

type Props = {};

export default class App extends React.Component<Props> {
  timerId: IntervalID;

  componentDidMount() {
    this.bootstrap();
    this.timerId = setInterval(() => {
      pollOperations();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  bootstrap = async () => {
    try {
      let {
        user: { publicKey },
      } = store.getState();
      // load redux store from async storage and upgrade async storage is necessary
      if (!publicKey) await bootstrapAndUpgrade();
      // reset operations
      store.dispatch(resetOperations());
      // fetch user info
      if (!publicKey) {
        publicKey = store.getState().user.publicKey;
      }

      if (publicKey) store.dispatch(fetchUserInfo());
      // once everything is set up
      // this.props.navigation.navigate(publicKey ? 'App' : 'Onboarding');
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer style={styles.container}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="#F52828"
              translucent={false}
            />
            <AppRoutes />
          </NavigationContainer>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
