import * as React from 'react';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/NewConnectionsScreens/ScanCodeScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PendingConnectionsScreen from '@/components/NewConnectionsScreens/PendingConnectionsScreen';
import GroupConnectionScreen from '@/components/NewConnectionsScreens/GroupConnectionScreen';
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
      name="ConnectSuccess"
      component={SuccessScreen}
      options={connectionPreviewOptions}
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
