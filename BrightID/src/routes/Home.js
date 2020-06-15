import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { SvgXml } from 'react-native-svg';
import { DEVICE_LARGE, ORANGE, DEVICE_IOS } from '@/utils/constants';
import HomeScreen from '@/components/HomeScreen';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/NewConnectionsScreens/ScanCodeScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PreviewConnectionScreen from '@/components/NewConnectionsScreens/PreviewConnectionScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import backArrow from '@/static/back_arrow.svg';
import { navigate } from '@/NavigationService';

const Stack = createStackNavigator();

const homeScreenOptions = {
  headerTitle: () => (
    <Image
      source={require('@/static/brightid-final.png')}
      accessible={true}
      accessibilityLabel="Home Header Logo"
      resizeMode="contain"
      style={{ width: DEVICE_LARGE ? 104 : 85 }}
    />
  ),
  headerLeft: () => null,
  headerRight: () => (
    <Material
      name="bell"
      size={DEVICE_LARGE ? 28 : 23}
      color="#000"
      style={{ marginRight: 25 }}
    />
  ),
  headerStyle: {
    height: DEVICE_LARGE ? 80 : 70,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  headerTitleAlign: 'center',
};

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
};

const recoveringConnectionOptions = {
  title: 'Account Recovery',
  headerShown: DEVICE_LARGE,
};

const Home = () => (
  <Stack.Navigator headerMode="screen">
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={homeScreenOptions}
    />
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
    <Stack.Screen
      name="RecoveringConnection"
      component={RecoveringConnectionScreen}
      options={recoveringConnectionOptions}
    />
  </Stack.Navigator>
);

export default Home;
