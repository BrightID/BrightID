import * as React from 'react';
import {
  Clipboard,
  Image,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useSelector } from 'react-redux';
import { INVITE_ACTIVE, DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '@/components/HomeScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import { navigate } from '@/NavigationService';
import { headerOptions } from './helpers';

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
  headerLeft: () => {
    if (__DEV__) {
      return (
        <TouchableOpacity
          testID="pasteDeeplink"
          style={{ marginLeft: 10 }}
          onPress={async () => {
            const text = await Clipboard.getString();
            console.log(`Linking.openURL with ${text}`);
            Linking.openURL(text);
          }}
        >
          <Material
            name="content-paste"
            size={DEVICE_LARGE ? 28 : 23}
            color="#000"
          />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  },
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

const recoveringConnectionOptions = {
  ...headerOptions,
  title: 'Account Recovery',
};

const Home = () => {
  const notificationCount = useSelector(
    ({ user: { notifications }, groups: { invites } }) =>
      notifications?.length +
      invites?.filter((invite) => invite.state === INVITE_ACTIVE)?.length,
  );
  return (
    <>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={homeScreenOptions(notificationCount)}
      />
      <Stack.Screen
        name="RecoveringConnection"
        component={RecoveringConnectionScreen}
        options={recoveringConnectionOptions}
      />
    </>
  );
};

export default Home;
