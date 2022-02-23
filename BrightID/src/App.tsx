import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  getStateFromPath,
  NavigationContainer,
} from '@react-navigation/native';
import { Linking } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import AppRoutes from './routes';
import { store, persistor } from './store';
import { navigationRef } from './NavigationService';
import InitialLoading from './components/Helpers/InitialLoadingScreen';
import { NotificationBanner } from './components/Helpers/NotificationBanner';

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
        App: {
          screens: {
            Apps: {
              path: 'link-verification/:baseUrl?/:context/:contextId/',
              exact: true,
            },
            ScanCode: {
              path: 'connection-code/:qrcode',
              exact: true,
            },
          },
        },
      },
    },
    getStateFromPath: (path, options) => {
      // handle link-app paths
      let linkAppParams = null;
      if (path.startsWith('/link-app/')) {
        let paramsString = path.substring(10);

        const version = paramsString.split('/')[0];
        paramsString = paramsString.substring(paramsString.indexOf('/') + 1);

        if (version === 'v1') {
          const [context, contextId, callbackUrl] = paramsString.split('/');
          if (context && contextId) {
            linkAppParams = {
              context,
              contextId,
              callbackUrl: callbackUrl
                ? decodeURIComponent(callbackUrl)
                : undefined,
            };
          }
        }
      }
      console.log(linkAppParams);
      if (linkAppParams) {
        return {
          routes: [
            {
              name: 'App',
              state: {
                routes: [
                  {
                    name: 'Apps',
                    params: linkAppParams,
                  },
                ],
              },
            },
          ],
        };
      }
      return getStateFromPath(path, options);
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

  console.log('RENDERING ENTIRE APP');

  return (
    <Provider store={store}>
      <PersistGate
        loading={<InitialLoading app={true} />}
        persistor={persistor}
      >
        <ActionSheetProvider>
          <SafeAreaProvider>
            <NotificationBanner />
            <NavigationContainer
              linking={linking}
              ref={navigationRef}
              fallback={<InitialLoading app={false} />}
            >
              <AppRoutes />
            </NavigationContainer>
          </SafeAreaProvider>
        </ActionSheetProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
