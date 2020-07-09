// @flow

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import Apps from './Apps';
import Connections from './Connections';
import Groups from './Groups';
import Home from './Home';
import NewConnections from './NewConnections';
import Notifications from './Notifications';
import Onboarding from './Onboarding';

const TopStack = createStackNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
  return (
    <Stack.Navigator headerMode="screen">
      {Home()}
      {NewConnections()}
      {Connections()}
      {Groups()}
      {Notifications()}
      {Apps()}
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
