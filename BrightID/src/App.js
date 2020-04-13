// @flow

import * as React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { pollOperations } from './utils/operations';
import AppRoutes from './AppRoutes';
import { store, persistor } from './store';
import BottomNav from './BottomNav';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

type Props = {};

export default class App extends React.Component<Props> {
  timerId: IntervalID;

  componentDidMount() {
    this.timerId = setInterval(() => {
      pollOperations();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  render() {
    return (
      <Provider store={store}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#F52828"
          translucent={false}
        />
        <PersistGate loading={null} persistor={persistor}>
          <View style={styles.container}>
            <AppRoutes />
            <BottomNav />
          </View>
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
