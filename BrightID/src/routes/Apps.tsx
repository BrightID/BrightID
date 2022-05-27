import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import AppsScreen from '@/components/Apps/AppsScreen';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

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
  <Stack.Screen name="Apps" component={AppsScreen} options={topOptions} />
);

export default Apps;
