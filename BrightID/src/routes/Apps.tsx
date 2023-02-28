import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { headerOptions, NavHome } from './helpers';
import AppsScreenController from '@/components/Apps/AppsScreenController';
import { Stack } from './Navigator';

const topOptions: StackNavigationOptions = {
  ...headerOptions,
  headerTitle: 'Application',
  headerLeft: () => <NavHome />,
  headerStyle: {
    height: DEVICE_LARGE ? 80 : 70,
    shadowRadius: 0,
    elevation: -1,
  },
  headerTitleAlign: 'center',
  headerTintColor: 'transparent',
  headerTransparent: true,
};

const Apps = () => (
  <Stack.Screen
    name="Apps"
    component={AppsScreenController}
    options={topOptions}
  />
);

export default Apps;
