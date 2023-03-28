import * as React from 'react';
import { useEffect, useState } from 'react';

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
import { Stack } from './Navigator';

const MainTabs = (id: string) => {
  return (
    <Stack.Group
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
    </Stack.Group>
  );
};

const App = () => {
  const { eula, id } = useSelector((state) => state.user);
  const { publicKey, secretKey } = useSelector((state) => state.keypair);
  const languageTag = useSelector(selectLanguageTag);
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

  const topStack = !eula ? Eula(eula) : !id ? Onboarding() : MainTabs(id);

  return (
    <NodeApiGate>
      {keyError ? (
        <MissingKeysScreen keyError={keyError} />
      ) : (
        <Stack.Navigator detachInactiveScreens={false}>
          {topStack}
        </Stack.Navigator>
      )}
    </NodeApiGate>
  );
};
export default App;
