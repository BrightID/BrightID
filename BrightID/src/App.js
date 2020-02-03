// @flow

import * as React from 'react';
import { Provider } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { MenuProvider } from 'react-native-popup-menu';

import AppRoutes from './AppRoutes';
import store from './store';
import fetchUserInfo from './actions/fetchUserInfo';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

type Props = {};

export default class App extends React.Component<Props> {
  componentDidMount() {
    this.intervalId = setInterval(() => {
      store.dispatch(fetchUserInfo());
    }, 3000);
  }

  componentWillUnmount() {
    clearInterval(clearInterval(this.intervalId));
  }

  render() {
    return (
      <MenuProvider>
        <Provider store={store}>
          <View style={styles.container}>
            <AppRoutes />
          </View>
        </Provider>
      </MenuProvider>
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
