import React from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
// import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { headerOptions, NavHome } from './helpers';
import AppsScreenController from '@/components/Apps/AppsScreenController';
import { Stack } from './Navigator';

const topOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerTitle: 'Application',
  headerLeft: () => <NavHome />,
  // headerStyle: {
  //   height: DEVICE_LARGE ? 80 : 70,
  //   shadowRadius: 0,
  //   elevation: -1,
  // },
  headerTitleAlign: 'center',
  headerTintColor: 'transparent',
  headerTransparent: true,
  headerBackVisible: false,
};

const Apps = () => (
  <Stack.Screen
    name="Apps"
    component={AppsScreenController}
    options={topOptions}
  />
);

export default Apps;
