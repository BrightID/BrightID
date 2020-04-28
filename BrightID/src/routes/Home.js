import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { delStorage } from '@/utils/dev';
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

const Home = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Home"
      component={HomeScreen}
      options={homeScreenOptions}
    />
    <Stack.Screen name="NewConnection" component={NewConnectionScreen} />
    <Stack.Screen name="ConnectSuccess" component={SuccessScreen} />
    <Stack.Screen
      name="PreviewConnection"
      component={PreviewConnectionScreen}
    />
    <Stack.Screen
      name="RecoveringConnection"
      component={RecoveringConnectionScreen}
    />
  </Stack.Navigator>
);

export default Home;
