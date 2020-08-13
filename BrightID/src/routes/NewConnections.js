import * as React from 'react';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/NewConnectionsScreens/ScanCodeScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import { NavHome } from './helpers';
import PendingConnectionsScreen from '@/components/NewConnectionsScreens/PendingConnectionsScreen';
import GroupConnectionScreen from '@/components/NewConnectionsScreens/GroupConnectionScreen';
import backArrow from '@/static/back_arrow.svg';

const Stack = createStackNavigator();

const newConnectionOptions = {
  headerLeft: () => <NavHome />,
  headerBackTitleVisible: false,
  headerStyle: {
    height: DEVICE_LARGE ? 80 : 60,
    backgroundColor: ORANGE,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  title: '',
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
      options={connectionPreviewOptions}
    />
  </>
);

export default NewConnections;
