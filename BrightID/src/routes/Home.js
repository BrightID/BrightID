import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
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
import { navigate } from '@/NavigationService';
import { headerOptions } from './helpers';
import TasksScreen from '../components/Tasks/TasksScreen';

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

const AchievementsLink = () => (
  <TouchableOpacity
    style={{ marginLeft: 40 }}
    onPress={() => {
      navigate('Tasks');
    }}
  >
    <Material name="certificate" size={DEVICE_LARGE ? 31 : 27} color="#000" />
  </TouchableOpacity>
);

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
  headerLeft: () => <AchievementsLink />,
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
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={taskScreenOptions}
      />
    </>
  );
};

export default Home;
