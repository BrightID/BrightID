// @flow

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { pollOperations } from './utils/operations';
import AppRoutes from './routes';
import { store, persistor } from './store';
import { navigationRef } from './NavigationService';
import Loading from './components/Helpers/LoadingScreen';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

// NOTE: BOOTSTRAP happens inside of LoadingScreen

export const App = () => {
  // setup deep linking
  const linking = {
    prefixes: ['brightid://', 'https://app.brightid.org'],
    config: {
      Apps: 'link-verification/:baseUrl/:context/:contextId',
      ScanCode: 'connection-code/:qrcode',
    },
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      pollOperations();
    }, 5000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading app={true} />} persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer
            style={styles.container}
            ref={navigationRef}
            linking={linking}
            fallback={<Loading />}
          >
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
