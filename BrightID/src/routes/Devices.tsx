import * as React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import AddDeviceScreen from '@/components/Onboarding/ImportFlow/AddDeviceScreen';
import DevicesScreen from '@/components/Onboarding/ImportFlow/DevicesScreen';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

const topOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
};

const Devices = () => {
  return (
    <>
      <Stack.Screen
        name="Add Device"
        component={AddDeviceScreen}
        options={topOptions}
      />
      <Stack.Screen
        name="Devices"
        component={DevicesScreen}
        options={topOptions}
      />
    </>
  );
};

export default Devices;
