import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { useSelector } from '@/store/hooks';
import NodeApiGate from '@/components/NodeApiGate';
import Apps from './Apps';
import RecoveringConnection from './RecoveringConnection';
import Devices from './Devices';
import Connections from './Connections';
import RecoveryConnections from './RecoveryConnections';
import Eula from './Eula';
import Groups from './Groups';
import Home from './Home';
import Modals from './Modals';
import PendingConnections from './PendingConnections';
import Notifications from './Notifications';
import Onboarding from './Onboarding';
import { selectLanguageTag } from '@/reducer/settingsSlice';
import MissingKeysScreen from '@/routes/MissingKeysScreen';
import { verifyKeypair } from '@/utils/cryptoHelper';

const TopStack = createStackNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Stack.Navigator headerMode="screen">
      {Home()}
      {PendingConnections()}
      {Connections()}
      {RecoveryConnections()}
      {Groups()}
      {Notifications()}
      {Devices()}
      {Apps()}
      {Modals()}
      {RecoveringConnection()}
    </Stack.Navigator>
  );
};

const MainApp = () => {
  const id = useSelector((state) => state.user.id);
  const eula = useSelector((state) => state.user.eula);
  const languageTag = useSelector(selectLanguageTag);
  const { secretKey, publicKey } = useSelector((state) => state.keypair);
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    const runEffect = async () => {
      if (languageTag && i18next.resolvedLanguage !== languageTag) {
        console.log(
          `Setting language from ${i18next.resolvedLanguage} to ${languageTag}`,
        );
        await i18next.changeLanguage(languageTag);
      }
    };
    runEffect();
  }, [languageTag]);

  useEffect(() => {
    if (id) {
      console.log(`checking secret key`);
      try {
        verifyKeypair({ publicKey, secretKey });
        setKeyError('');
      } catch (e) {
        console.log('Invalid keypair', `${e instanceof Error ? e.message : e}`);
        setKeyError(e instanceof Error ? e.message : e);
      }
    }
  }, [id, secretKey, publicKey]);

  // decide which screen/navigator to render
  let topStack;
  if (!eula) {
    topStack = (
      <TopStack.Screen
        name="Eula"
        component={Eula}
        options={{ headerShown: false }}
      />
    );
  } else if (!id) {
    topStack = (
      <TopStack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{ headerShown: false }}
      />
    );
  } else {
    topStack = (
      <TopStack.Screen
        name="App"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    );
  }

  return (
    <NodeApiGate>
      {keyError ? (
        <MissingKeysScreen keyError={keyError} />
      ) : (
        <TopStack.Navigator>{topStack}</TopStack.Navigator>
      )}
    </NodeApiGate>
  );
};

export default MainApp;
