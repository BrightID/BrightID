import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Simple from 'react-native-vector-icons/SimpleLineIcons';
// import { delStorage } from '@/utils/dev';
import { DEVICE_LARGE } from '@/utils/constants';
import { shareConnection } from '@/components/NewConnectionsScreens/actions/shareConnection';
import HomeScreen from '@/components/HomeScreen';
import NewConnectionScreen from '@/components/NewConnectionsScreens/NewConnectionScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PreviewConnectionScreen from '@/components/NewConnectionsScreens/PreviewConnectionScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';

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
    height: 80,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  headerTitleAlign: 'center',
};

const newConnectionOptions = {
  title: 'New Connection',
  headerRight: () => (
    <TouchableOpacity style={{ marginRight: 11 }} onPress={shareConnection}>
      <Simple name="share-alt" size={25} color="#fff" />
    </TouchableOpacity>
  ),
  headerShown: DEVICE_LARGE,
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
      name="NewConnection"
      component={NewConnectionScreen}
      options={newConnectionOptions}
    />
    <Stack.Screen name="ConnectSuccess" component={SuccessScreen} />
    <Stack.Screen
      name="PreviewConnection"
      component={PreviewConnectionScreen}
      options={{ title: 'New Connection' }}
    />
    <Stack.Screen
      name="RecoveringConnection"
      component={RecoveringConnectionScreen}
      options={recoveringConnectionOptions}
    />
  </Stack.Navigator>
);

export default Home;
