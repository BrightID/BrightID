import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Simple from 'react-native-vector-icons/SimpleLineIcons';
// import { delStorage } from '@/utils/dev';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
import { shareConnection } from '@/components/NewConnectionsScreens/actions/shareConnection';
import HomeScreen from '@/components/HomeScreen';
import MyCodeScreen from '@/components/NewConnectionsScreens/MyCodeScreen';
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
    height: DEVICE_LARGE ? 80 : 70,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  headerTitleAlign: 'center',
};

// const BackButton = () => {
//   const navigation = useNavigation();
//   return (
//     <TouchableOpacity onPress={navigation.navigate('Home')}>
//       <Material
//         name="chevron-left"
//         size={DEVICE_LARGE ? 42 : 23}
//         color="#fff"
//         style={{ marginLeft: 10 }}
//       />
//     </TouchableOpacity>
//   );
// };

const newConnectionOptions = {
  // headerLeft: () => <BackButton />,
  headerStyle: {
    height: DEVICE_LARGE ? 60 : 60,
    backgroundColor: ORANGE,
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
