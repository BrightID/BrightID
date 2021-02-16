import * as React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import NotificationsScreen from '@/components/Notifications/NotificationsScreen';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

const topOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
};

const Notifications = () => {
  return (
    <>
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={topOptions}
      />
    </>
  );
};

export default Notifications;
