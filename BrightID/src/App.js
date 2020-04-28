// @flow

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { pollOperations } from './utils/operations';
import AppRoutes from './routes';
import { store, persistor } from './store';
import { bootstrap } from './bootstrap';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

export const App = () => {
  useEffect(() => {
    bootstrap();
    const timerId = setInterval(() => {
      pollOperations();
    }, 5000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer style={styles.container}>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="#F52828"
              translucent={false}
            />
            <AppRoutes />
          </NavigationContainer>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default App;
