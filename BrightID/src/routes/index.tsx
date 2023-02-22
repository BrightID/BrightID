import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import i18next from 'i18next';
import { useSelector } from '@/store/hooks';
import NodeApiGate from '@/components/NodeApiGate';
import { selectLanguageTag } from '@/reducer/settingsSlice';
import MissingKeysScreen from '@/routes/MissingKeysScreen';
import { verifyKeypair } from '@/utils/cryptoHelper';
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

const TopStack = createStackNavigator();

const MainTabs = (id: string) => {
  return (
    <TopStack.Group
      navigationKey={id || 'nope'}
      screenOptions={{
        cardOverlayEnabled: false,
        cardShadowEnabled: false,
        // freezeOnBlur: false,
      }}
    >
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
    </TopStack.Group>
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
    topStack = Eula(eula);
  } else if (!id) {
    topStack = Onboarding();
  } else {
    topStack = MainTabs(id);
  }

  // detachInactiveScreens={false}

  return (
    <NodeApiGate>
      {keyError ? (
        <MissingKeysScreen keyError={keyError} />
      ) : (
        <TopStack.Navigator detachInactiveScreens={false}>
          {topStack}
        </TopStack.Navigator>
      )}
    </NodeApiGate>
  );
};

export default MainApp;
