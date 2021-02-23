import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import RecoveringConnectionScreen from '@/components/Onboarding/RecoveryFlow/RecoveringConnectionScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import TrustedConnectionsScreen from '@/components/Onboarding/RecoveryFlow/TrustedConnectionsScreen';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle } from './helpers';

const Stack = createStackNavigator();

const trustedScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t(
        'backup.header.trustedConnections',
        'Trusted connections',
      )}
    />
  ),
};

const recoveringScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('restore.header.accountRecovery')} />
  ),
};

const Connections = () => {
  return (
    <>
      <Stack.Screen
        name="TrustedConnections"
        component={TrustedConnectionsScreen}
        options={trustedScreenOptions}
      />
      <Stack.Screen
        name="RecoveringConnection"
        component={RecoveringConnectionScreen}
        options={recoveringScreenOptions}
      />
    </>
  );
};

export default Connections;
