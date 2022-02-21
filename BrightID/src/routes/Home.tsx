import React from 'react';
import {
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  TouchableOpacity,
} from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from '@/store';
import { INVITE_ACTIVE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK, WHITE } from '@/theme/colors';
import { createSelector } from '@reduxjs/toolkit';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import Bell from '@/components/Icons/NotificationBell';
import Menu from '@/components/Icons/Menu';
import {
  pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/PendingConnections/pendingConnectionSlice';
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
      // @ts-ignore
      (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
    ),
);

const inviteSelector = createSelector(
  (state: State) => state.groups.invites,
  (invites) => invites.filter(({ state }) => state === INVITE_ACTIVE),
);

/** COMPONENTS */

const NotificationBell = ({ routeName }) => {
  const pendingConnections = useSelector(
    (state: State) => unconfirmedSelector(state)?.length,
  );

  const invites = useSelector((state: State) => inviteSelector(state)?.length);

  const backupPending = useSelector(
    (state: State) => state.notifications.backupPending,
  );

  const displayBadge = backupPending || invites || pendingConnections;

  return (
    <TouchableOpacity
      testID="notificationsBtn"
      style={{ marginRight: 25 }}
      onPress={() => {
        Keyboard.dismiss();
        resetNotifications();
      }}
    >
      <Bell
        color={routeName === 'Home' ? WHITE : BLACK}
        alert={!!displayBadge}
      />
    </TouchableOpacity>
  );
};

/** OPTIONS */

const BrightIdLogo = ({ routeName }) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        resetHome();
      }}
      testID="BrightIdLogo"
    >
      <Image
        source={
          routeName === 'Home'
            ? require('@/static/brightid-white.png')
            : require('@/static/brightid-final.png')
        }
        accessible={true}
        accessibilityLabel="Home Header Logo"
        resizeMode="contain"
        style={{ width: DEVICE_LARGE ? 104 : 85, maxHeight: 80 }}
      />
    </TouchableWithoutFeedback>
  );
};

const ToogleDrawer = ({ routeName }) => {
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
      <Menu
        width={DEVICE_LARGE ? 30 : 24}
        color={routeName === 'Home' ? WHITE : BLACK}
      />
    </TouchableOpacity>
  );
};

const homeScreenOptions = ({ route }): StackNavigationOptions => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

  return {
    headerTitle: () => <BrightIdLogo routeName={routeName} />,
    headerLeft: () => <ToogleDrawer routeName={routeName} />,
    headerRight: () => <NotificationBell routeName={routeName} />,
    headerStyle: {
      height: DEVICE_LARGE ? 80 : 70,
      shadowRadius: 0,
      elevation: -1,
      borderWidth: 1,
    },
    headerTitleAlign: 'center',
    headerTintColor: 'transparent',
    headerTransparent: true,
  };
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
