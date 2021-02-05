import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import RecoveringConnectionScreen from '@/components/Onboarding/RecoveryFlow/RecoveringConnectionScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import TrustedConnectionsScreen from '@/components/Onboarding/RecoveryFlow/TrustedConnectionsScreen';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle } from './helpers';

const Stack = createStackNavigator();

const trustedScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t(
        'backup.header.trustedConnections',
        'Trusted connections',
      )}
    />
  ),
};

const recoveringScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('restore.header.accountRecovery')} />
  ),
};

const Connections = () => {
  const { t } = useTranslation();
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
