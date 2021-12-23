import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import NewRecoveryConnectionsListScreen from '@/components/RecoveryConnections/NewRecoveryConnectionScreen';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle, NavHome } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerTitle: () => <AnimatedHeaderTitle text="Recovery Connections" />,
};

const Connections = () => {
  return (
    <>
      <Stack.Screen
        name="RecoveryConnectionsList"
        component={NewRecoveryConnectionsListScreen}
        options={connectionsScreenOptions}
      />
    </>
  );
};

export default Connections;
