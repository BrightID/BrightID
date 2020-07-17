// @flow

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  getActionFromState,
  useLinking,
} from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { pollOperations } from '@/utils/operations';
import AppRoutes from './routes';
import { store, persistor } from './store';
import { navigationRef, dispatch } from './NavigationService';
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
      screens: {
        Apps: 'link-verification/:baseUrl/:context/:contextId',
        ScanCode: 'connection-code/:qrcode',
      },
    },
  };

  const [initialState, setInitialState] = useState(null);
  const { getInitialState } = useLinking(navigationRef, linking);

  useEffect(() => {
    getInitialState()
      .catch(() => {})
      .then(setInitialState);
  }, [getInitialState]);

  useEffect(() => {
    const timerId = setInterval(() => {
      pollOperations();
    }, 5000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    if (initialState) {
      setTimeout(() => {
        dispatch(getActionFromState(initialState));
      }, 100);
    }
  }, [initialState]);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading app={true} />} persistor={persistor}>
        <SafeAreaProvider>
          {initialState || typeof initialState === 'undefined' ? (
            <NavigationContainer
              initialState={initialState}
              style={styles.container}
              ref={navigationRef}
            >
              <AppRoutes />
            </NavigationContainer>
          ) : null}
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
