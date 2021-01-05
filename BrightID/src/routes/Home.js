import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
// import { useTranslation } from 'react-i18next';
import { INVITE_ACTIVE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK } from '@/theme/colors';
import { createSelector } from '@reduxjs/toolkit';
import { createStackNavigator } from '@react-navigation/stack';
import Bell from '@/components/Icons/NotificationBell';
import Menu from '@/components/Icons/Menu';
import {
  pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import {
  toggleDrawer,
  resetHome,
  resetNotifications,
} from '@/NavigationService';
import { HomeDrawer } from './HomeDrawer';

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
        Keyboard.dismiss();
        resetNotifications();
      }}
    >
      <Bell size={DEVICE_LARGE ? 28 : 23} color={BLACK} alert={displayBadge} />
    </TouchableOpacity>
  );
};

/** OPTIONS */

const BrightIdLogo = () => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        resetHome();
      }}
    >
      <Image
        source={require('@/static/brightid-final.png')}
        accessible={true}
        accessibilityLabel="Home Header Logo"
        resizeMode="contain"
        style={{ width: DEVICE_LARGE ? 104 : 85, maxHeight: 80 }}
      />
    </TouchableWithoutFeedback>
  );
};

const homeScreenOptions = {
  headerTitle: () => <BrightIdLogo />,
  headerLeft: () => {
    return (
      <TouchableOpacity
        testID="toggleDrawer"
        style={{
          width: DEVICE_LARGE ? 80 : 70,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          Keyboard.dismiss();
          toggleDrawer();
        }}
      >
        <Menu width={DEVICE_LARGE ? 30 : 24} />
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
    elevation: -1,
  },
  headerTitleAlign: 'center',
  headerTintColor: 'transparent',
  headerTransparent: true,
};

/** SCREENS */

const Stack = createStackNavigator();

const Home = () => {
  /* /!\ Moved 'RecoveringConnection' options to the component in order to access to useTranslation() */
  // const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        name="Home"
        component={HomeDrawer}
        options={homeScreenOptions}
      />
    </>
  );
};

export default Home;
