import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import NewRecoveryConnectionsListScreen from '@/components/RecoveryConnections/NewRecoveryConnectionScreen';
import ReplaceRecoveryConnectionsListScreen from '@/components/RecoveryConnections/ReplaceRecoveryConnectionScreen';
import ConnectionScreenController from '@/components/Connections/ConnectionScreenController';
import SearchConnections from '@/components/Helpers/SearchConnections';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle, NavHome } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerTitle: () => <AnimatedHeaderTitle text={'Recovery Connections'} />,
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
        name="RecoveryConnectionsList"
        component={NewRecoveryConnectionsListScreen}
        options={connectionsScreenOptions}
      />
      <Stack.Screen
        name="ReplaceRecoveryConnections"
        component={ReplaceRecoveryConnectionsListScreen}
        options={connectionsScreenOptions}
      />
    </>
  );
};

export default Connections;
