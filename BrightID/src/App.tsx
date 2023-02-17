import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Linking } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import ErrorBoundary from 'react-native-error-boundary';
import { persistStore } from 'redux-persist';
import { navigationRef } from './NavigationService';
import InitialLoading from './components/Helpers/InitialLoadingScreen';
import { NotificationBanner } from './components/Helpers/NotificationBanner';
import MainApp from '@/routes';
import ErrorFallback from '@/components/ErrorFallback';
import { bootstrap } from '@/bootstrap';
import { notificationSubscription } from '@/NotificationService';
import { setupStore } from '@/store';

/**
 * Central part of the application
 * react-navigation is used for routing
 * read docs here: https://reactnavigation.org/
 */
export const App = () => {
  // create store
  const store = setupStore();

  // setup deep linking
  const linking = {
    prefixes: ['brightid://', 'https://app.brightid.org'],
    config: {
      screens: {
        Apps: {
          path: 'link-verification/:baseUrl?/:appId/:appUserId/',
          exact: true,
          parse: {
            baseUrl: (baseUrl) => {
              return decodeURIComponent(baseUrl);
            },
          },
        },
        NodeModal: {
          path: 'local-server',
          exact: true,
        },
        ScanCode: {
          path: 'connection-code/:qrcode',
          exact: true,
        },
      },
    },
    // Add custom subscribe method to prevent crashes when url is undefined
    subscribe(listener) {
      // default deep link handling
      const onReceiveURL = ({ url }: { url: string }) => {
        if (url) {
          console.log(
            `Custom subscribe got url ${url}. Calling listener callback.`,
          );
          listener(url);
        } else {
          console.log(`Custom subscribe got undefined url. Ignoring event.`);
        }
      };

      // Listen to incoming links from deep linking
      const emitterSubscription = Linking.addEventListener('url', onReceiveURL);
      return () => {
        // Clean up the event listeners
        emitterSubscription.remove();
      };
    },
  };

  // bootstrap app when Redux-Persist is done rehydrating
  const onBeforeLift = async () => {
    console.log('BOOSTRAPING APP');
    await bootstrap(store.dispatch);
    console.log('SUBSCRIBING TO NOTIFICATIONS');
    notificationSubscription(store.dispatch, store.getState);
    console.log('DONE BOOTSTRAP');
  };

  return (
    <Provider store={store}>
      <PersistGate
        loading={<InitialLoading />}
        persistor={persistStore(store)}
        onBeforeLift={onBeforeLift}
      >
        <ActionSheetProvider>
          <SafeAreaProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <NotificationBanner />
              <NavigationContainer
                linking={linking}
                ref={navigationRef}
                fallback={<InitialLoading />}
              >
                <MainApp />
              </NavigationContainer>
            </ErrorBoundary>
          </SafeAreaProvider>
        </ActionSheetProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
