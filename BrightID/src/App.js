// @flow

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useLinking } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { pollOperations } from './utils/operations';
import AppRoutes from './routes';
import { store, persistor } from './store';
import { bootstrap } from './bootstrap';
import { navigationRef } from './NavigationService';
import Loading from './components/Helpers/LoadingScreen';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */

const deepLinkTimeout = () =>
  new Promise((resolve) =>
    // Timeout in 150ms if `getInitialState` doesn't resolve
    // Workaround for https://github.com/facebook/react-native/issues/25675
    setTimeout(resolve, 150),
  );

export const App = () => {
  // setup deep linking
  const { getInitialState } = useLinking(navigationRef, {
    prefixes: ['brightid://'],
    config: {
      Apps: {
        screens: {
          Apps: 'link-verification/:baseUrl/:context/:contextId',
        },
      },
    },
  });

  const [isReady, setIsReady] = React.useState(false);
  const [initialState, setInitialState] = React.useState();

  useEffect(() => {
    Promise.race([getInitialState(), deepLinkTimeout()])
      .catch((e) => {
        console.log(e.message);
        setIsReady(true);
      })
      .then((state) => {
        if (state !== undefined) {
          setInitialState(state);
        }
        setIsReady(true);
      });
  }, [getInitialState]);

  // bootstrap app
  useEffect(() => {
    bootstrap();
    const timerId = setInterval(() => {
      pollOperations();
      console.log('polling operations');
    }, 5000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <SafeAreaProvider>
          {isReady ? (
            <NavigationContainer
              style={styles.container}
              ref={navigationRef}
              initialState={initialState}
            >
              <StatusBar
                barStyle="dark-content"
                backgroundColor="#F52828"
                translucent={false}
              />
              <AppRoutes />
            </NavigationContainer>
          ) : (
            <Loading />
          )}
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
