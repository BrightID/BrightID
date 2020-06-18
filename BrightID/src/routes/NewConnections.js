import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { DEVICE_LARGE, ORANGE, DEVICE_IOS } from '@/utils/constants';
import { SvgXml } from 'react-native-svg';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/NewConnectionsScreens/ScanCodeScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PreviewConnectionScreen from '@/components/NewConnectionsScreens/PreviewConnectionScreen';
import backArrow from '@/static/back_arrow.svg';
import { navigate } from '@/NavigationService';

const Stack = createStackNavigator();

const newConnectionOptions = {
  headerLeft: () => (
    <TouchableOpacity
      style={{
        marginLeft: DEVICE_IOS ? 25 : 10,
        marginTop: DEVICE_LARGE ? 15 : 10,
      }}
      onPress={() => {
        navigate('Home');
      }}
    >
      <SvgXml height="25" xml={backArrow} />
    </TouchableOpacity>
  ),
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
  headerLeft: () => null,
  headerStyle: {
    height: DEVICE_LARGE ? 80 : 60,
    backgroundColor: '#fff',
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  title: '',
  cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid,
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
      name="PreviewConnection"
      component={PreviewConnectionScreen}
      options={connectionPreviewOptions}
    />
  </>
);

export default NewConnections;
