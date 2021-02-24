import * as React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackNavigationOptions,
} from '@react-navigation/stack';
import MyCodeScreen from '@/components/PendingConnections/MyCodeScreen';
import ScanCodeScreen from '@/components/PendingConnections/ScanCodeScreen';
import PendingConnectionsScreen from '@/components/PendingConnections/PendingConnectionsScreen';
import GroupConnectionScreen from '@/components/PendingConnections/GroupConnectionScreen';
import { NavHome, headerOptions } from './helpers';

const Stack = createStackNavigator();

const newConnectionOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerBackTitleVisible: false,
  title: '',
};

const groupConnectionOptions: StackNavigationOptions = {
  ...headerOptions,
  title: 'Group Connection',
};

const connectionPreviewOptions: StackNavigationOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
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
