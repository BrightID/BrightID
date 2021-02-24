import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import AppsScreen from '@/components/Apps/AppsScreen';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

const topOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
};

const Apps = () => (
  <Stack.Screen name="Apps" component={AppsScreen} options={topOptions} />
);

export default Apps;
