import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
import i18next from 'i18next';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import ConnectionScreenController from '@/components/Connections/ConnectionScreenController';
import SearchConnections from '@/components/Helpers/SearchConnections';
import { headerOptions, AnimatedHeaderTitle, NavHome } from './helpers';
import { Stack } from './Navigator';

const connectionsScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerLeft: () => <NavHome />,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t('connections.header.connections', 'Connections')}
    />
  ),
};

const connectionScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t(
        'connectionDetails.header.connectionDetails',
        'Connection details',
      )}
    />
  ),
};

const Connections = () => {
  return (
    <>
      <Stack.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={connectionsScreenOptions}
      />

      <Stack.Screen
        name="Connection"
        component={ConnectionScreenController}
        options={connectionScreenOptions}
      />
    </>
  );
};

export default Connections;
