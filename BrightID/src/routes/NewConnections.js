import * as React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import MyCodeScreen from '@/components/PendingConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/PendingConnectionsScreens/ScanCodeScreen';
import PendingConnectionsScreen from '@/components/PendingConnectionsScreens/PendingConnectionsScreen';
import GroupConnectionScreen from '@/components/PendingConnectionsScreens/GroupConnectionScreen';
import { NavHome, headerOptions } from './helpers';

const Stack = createStackNavigator();

const newConnectionOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerBackTitleVisible: false,
  title: '',
};

const groupConnectionOptions = {
  ...headerOptions,
  title: 'Group Connection',
};

const connectionPreviewOptions = {
  headerShown: false,
  cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
};

const NewConnections = () => (
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

export default NewConnections;
