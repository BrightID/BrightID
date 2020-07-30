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
import {
  pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import HomeScreen from '@/components/HomeScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import { navigate } from '@/NavigationService';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const NotificationBell = () => {
  const pendingConnections = useSelector(
    (state) =>
      selectAllPendingConnections(state).filter(
        (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
      ).length,
  );

  const invites = useSelector(
    (state) =>
      state.groups.invites.filter(({ state }) => state === INVITE_ACTIVE)
        .length,
  );

  const backupPending = useSelector(
    (state) => state.notifications.backupPending,
  );

  const displayBadge = backupPending || invites || pendingConnections;

  console.log('displayBadge', displayBadge);

  return (
    <TouchableOpacity
      style={{ marginRight: 25 }}
      onPress={() => {
        navigate('Notifications');
      }}
    >
      <Material name="bell" size={DEVICE_LARGE ? 28 : 23} color="#000" />
      {displayBadge ? (
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
  );
};

const DeepPasteLink = () => {
  if (__DEV__) {
    return (
      <TouchableOpacity
        testID="pasteDeeplink"
        style={{ marginLeft: 10 }}
        onPress={async () => {
          let url = await Clipboard.getString();
          url = url.replace('https://app.brightid.org', 'brightid://');
          console.log(`Linking.openURL with ${url}`);
          Linking.openURL(url);
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
};

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
  headerLeft: () => <DeepPasteLink />,
  headerRight: () => <NotificationBell />,
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

const recoveringConnectionOptions = {
  ...headerOptions,
  title: 'Account Recovery',
};

const Home = () => {
  return (
    <>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={homeScreenOptions}
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
