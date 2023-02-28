import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
// import i18next from 'i18next';
import NewRecoveryConnectionsListScreen from '@/components/RecoveryConnections/NewRecoveryConnectionScreen';
import { headerOptions, AnimatedHeaderTitle, NavHome } from './helpers';
import { Stack } from './Navigator';

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
