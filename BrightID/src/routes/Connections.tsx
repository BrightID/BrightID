import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import ConnectionScreenController from '@/components/Connections/ConnectionScreenController';
import SearchConnections from '@/components/Helpers/SearchConnections';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle, NavHome } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerLeft: () => <NavHome />,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t('connections.header.connections', 'Connections')}
    />
  ),
};

const connectionScreenOptions = {
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