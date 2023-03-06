import * as React from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import NotificationsScreen from '@/components/Notifications/NotificationsScreen';
import { headerOptions, NavHome } from './helpers';
import { Stack } from './Navigator';

const topOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerBackVisible: false,
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
