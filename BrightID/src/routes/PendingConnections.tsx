import * as React from 'react';
// TODO FIX THIS
// import { CardStyleInterpolators } from '@react-navigation/stack';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import MyCodeScreen from '@/components/PendingConnections/MyCodeScreen';
import ScanCodeScreen from '@/components/PendingConnections/ScanCodeScreen';
import PendingConnectionsScreen from '@/components/PendingConnections/PendingConnectionsScreen';
import GroupConnectionScreen from '@/components/PendingConnections/GroupConnectionScreen';
import { NavHome, headerOptions } from './helpers';
import { Stack } from './Navigator';

const newConnectionOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerBackVisible: false,
  title: '',
};

const groupConnectionOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  title: 'Group Connection',
};

const connectionPreviewOptions: NativeStackNavigationOptions = {
  headerShown: false,
  // cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
};

const PendingConnections = () => (
  <>
    <Stack.Screen
      name="MyCode"
      component={MyCodeScreen}
      options={newConnectionOptions}
    />
    <Stack.Screen
      name="ScanCode"
      component={ScanCodeScreen}
      options={newConnectionOptions}
    />
    <Stack.Screen
      name="PendingConnections"
      component={PendingConnectionsScreen}
      options={connectionPreviewOptions}
    />
    <Stack.Screen
      name="GroupConnection"
      component={GroupConnectionScreen}
      options={groupConnectionOptions}
    />
  </>
);

export default PendingConnections;
