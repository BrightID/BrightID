import * as React from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  Clipboard,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { INVITE_ACTIVE, DEVICE_LARGE } from '@/utils/constants';
import { createSelector } from '@reduxjs/toolkit';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import HomeScreen from '@/components/HomeScreen';
import RecoveringConnectionScreen from '@/components/Recovery/RecoveringConnectionScreen';
import { navigate, toggleDrawer } from '@/NavigationService';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { useState } from 'react';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { headerOptions } from './helpers';
import TasksScreen from '../components/Tasks/TasksScreen';
import { retrieveImage } from '../utils/filesystem';
import { getExplorerCode } from '../utils/explorer';

/** SELECTORS */

const unconfirmedSelector = createSelector(
  selectAllPendingConnections,
  (pendingConnections) =>
    pendingConnections.filter(
      (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
    ),
);

const inviteSelector = createSelector(
  (state) => state.groups.invites,
  (invites) => invites.filter(({ state }) => state === INVITE_ACTIVE),
);

/** COMPONENTS */

const NotificationBell = () => {
  const pendingConnections = useSelector(
    (state) => unconfirmedSelector(state)?.length,
  );

  const invites = useSelector((state) => inviteSelector(state)?.length);

  const backupPending = useSelector(
    (state) => state.notifications.backupPending,
  );

  const displayBadge = backupPending || invites || pendingConnections;

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

const getIcon = (name) => {
  return ({ focused, color, size }) => (
    <Material name={name} size={DEVICE_LARGE ? 28 : 23} color={color} />
  );
};

const CustomDrawerContent = (props) => {
  const hasPassword = useSelector(
    ({ user: { password } }) => password.length > 0,
  );
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const name = useSelector((state) => state.user.name);
  const verifications = useSelector((state) => state.user.verifications);
  const verified = verifications.includes('BrightID');
  const [profilePhoto, setProfilePhoto] = useState('none');
  retrieveImage(photoFilename).then((profilePhoto) => {
    setProfilePhoto(profilePhoto);
  });

  return (
    <DrawerContentScrollView labelStyle={{ fontSize: 30 }} {...props}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: profilePhoto,
          }}
          style={styles.drawerPhoto}
          accessibilityLabel="user photo"
        />
        <Text style={styles.drawerName}>{name}</Text>
        {verified && (
          <SvgXml
            style={styles.verificationSticker}
            width="16"
            height="16"
            xml={verificationSticker}
          />
        )}
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        inactiveTintColor="#000"
        label="Achievements"
        icon={getIcon('certificate')}
        onPress={() => {
          navigate('Tasks');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Connections"
        icon={getIcon('account')}
        onPress={() => {
          navigate('Connections');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Groups"
        icon={getIcon('account-group')}
        onPress={() => {
          navigate('Groups');
          props.navigation.closeDrawer();
        }}
      />
      <DrawerItem
        inactiveTintColor="#000"
        label="Apps"
        icon={getIcon('apps')}
        onPress={() => {
          navigate('Apps');
          props.navigation.closeDrawer();
        }}
      />
      {hasPassword && (
        <DrawerItem
          inactiveTintColor="#000"
          label="Copy Explorer Code"
          onPress={() => {
            const code = getExplorerCode();
            Clipboard.setString(code);
            props.navigation.closeDrawer();
          }}
          icon={getIcon('graphql')}
        />
      )}
    </DrawerContentScrollView>
  );
};

const HomeDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContentOptions={{
        activeTintColor: '#FFF',
        activeBackgroundColor: '#ED7A5D',
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        options={{
          drawerIcon: getIcon('home'),
        }}
        component={HomeScreen}
      />
    </Drawer.Navigator>
  );
};

/** OPTIONS */

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
  headerLeft: () => {
    return (
      <TouchableOpacity
        testID="toggleDrawer"
        style={{ marginLeft: 10 }}
        onPress={() => toggleDrawer()}
      >
        <Material name="menu" size={DEVICE_LARGE ? 36 : 28} color="#000" />
      </TouchableOpacity>
    );
  },
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

const taskScreenOptions = {
  ...headerOptions,
  title: 'Achievements',
};

/** SCREENS */

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const Home = () => {
  return (
    <>
      <Stack.Screen
        name="Home"
        component={HomeDrawer}
        options={homeScreenOptions}
      />
      <Stack.Screen
        name="RecoveringConnection"
        component={RecoveringConnectionScreen}
        options={recoveringConnectionOptions}
      />
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={taskScreenOptions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  drawerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 71,
  },
  profileContainer: {
    flexDirection: 'row',
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
  },
  drawerName: {
    fontSize: 16,
    marginLeft: 10,
  },
  verificationSticker: {
    marginLeft: 5,
    marginTop: 1.5,
  },
});

export default Home;
