import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import TrustedConnectionsScreen from '@/components/Recovery/TrustedConnectionsScreen';
import BackupScreen from '@/components/Recovery/BackupScreen';
import { headerOptions, AnimatedHeaderTitle } from './helpers';

const Stack = createStackNavigator();

const trustedScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerTitle: () => (
    <AnimatedHeaderTitle i18key="backup.header.trustedConnections" />
  ),
};

const recoveringScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerTitle: () => (
    <AnimatedHeaderTitle i18key="restore.header.accountRecovery" />
  ),
};

const Connections = () => {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{
          ...headerOptions,
          title: t('backup.header.backup'),
        }}
      />
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
