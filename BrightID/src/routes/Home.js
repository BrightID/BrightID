import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Simple from 'react-native-vector-icons/SimpleLineIcons';
import { delStorage } from '@/utils/dev';
import { DEVICE_TYPE } from '@/utils/constants';
import { shareConnection } from '@/components/NewConnectionsScreens/actions/shareConnection';
import HomeScreen from '@/components/HomeScreen';
import NewConnectionScreen from '@/components/NewConnectionsScreens/NewConnectionScreen';
import SuccessScreen from '@/components/NewConnectionsScreens/SuccessScreen';
import PreviewConnectionScreen from '@/components/NewConnectionsScreens/PreviewConnectionScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const homeScreenOptions = {
  title: 'BrightID',
  headerBackTitle: 'Home',
  headerRight: __DEV__
    ? ({ navigation }) => (
        <TouchableOpacity style={{ marginRight: 11 }} onPress={delStorage}>
          <Material size={32} name="dots-horizontal" color="#fff" />
        </TouchableOpacity>
      )
    : () => null,
};

const newConnectionOptions = {
  title: 'New Connection',
  // eslint-disable-next-line react/display-name
  headerRight: () => (
    <TouchableOpacity style={{ marginRight: 11 }} onPress={shareConnection}>
      <Simple name="share-alt" size={25} color="#fff" />
    </TouchableOpacity>
  ),
  headerShown: DEVICE_TYPE === 'large',
};

const recoveringConnectionOptions = {
  title: 'Account Recovery',
  headerShown: DEVICE_TYPE === 'large',
};

const Home = () => (
  <Stack.Navigator screenOptions={headerOptions}>
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
