// @flow

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { INVITE_ACTIVE } from '@/utils/constants';
import Apps from './Apps';
import Connections from './Connections';
import Groups from './Groups';
import Home from './Home';
import Notifications from './Notifications';
import Onboarding from './Onboarding';

const TopStack = createStackNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  const notificationCount = useSelector(
    ({ user: { notifications }, groups: { invites } }) =>
      notifications?.length +
      invites?.filter((invite) => invite.state === INVITE_ACTIVE)?.length,
  );
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Connections" component={Connections} />
      <Stack.Screen name="Groups" component={Groups} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Apps" component={Apps} />
    </Stack.Navigator>
  );
};

const MainApp = () => {
  const publicKey = useSelector((state) => state.user.publicKey);
  return (
    <TopStack.Navigator>
      {publicKey ? (
        <TopStack.Screen
          name="App"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      ) : (
        <TopStack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{ headerShown: false }}
        />
      )}
    </TopStack.Navigator>
  );
};

export default MainApp;
