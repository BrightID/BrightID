import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  INVITE_ACTIVE,
  DEVICE_LARGE,
  ORANGE,
  DEVICE_IOS,
} from '@/utils/constants';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { SvgXml } from 'react-native-svg';

import HomeScreen from '@/components/HomeScreen';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
import ScanCodeScreen from '@/components/NewConnectionsScreens/ScanCodeScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PreviewConnectionScreen from '@/components/NewConnectionsScreens/PreviewConnectionScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import backArrow from '@/static/back_arrow.svg';
import { navigate } from '@/NavigationService';

const Stack = createStackNavigator();

const homeScreenOptions = (notificationCount) => ({
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
    <TouchableOpacity
      style={{ marginRight: 25 }}
      onPress={() => {
        navigate('Notifications');
      }}
    >
      <Material name="bell" size={DEVICE_LARGE ? 28 : 23} color="#000" />
      {notificationCount ? (
        <View
          style={{
            backgroundColor: '#ED1B24',
            width: 9,
            height: 9,
            borderRadius: 5,
            position: 'absolute',
            top: 5,
            left: 17,
          }}
        />
      ) : null}
    </TouchableOpacity>
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
});

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

const Home = () => {
  const notificationCount = useSelector(
    ({ user: { notifications }, groups: { invites } }) =>
      notifications?.length +
      invites?.filter((invite) => invite.state === INVITE_ACTIVE)?.length,
  );
  return (
    <Stack.Navigator headerMode="screen">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={homeScreenOptions(notificationCount)}
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
};

export default Home;
