import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppsScreen from '@/components/Apps/AppsScreen';

const Stack = createStackNavigator();

const Apps = () => (
  <Stack.Navigator>
    <Stack.Screen name="Apps" component={AppsScreen} />
  </Stack.Navigator>
);

export default Apps;
