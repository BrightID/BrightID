import * as React from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import i18next from 'i18next';
import AddDeviceScreen from '@/components/Onboarding/ImportFlow/AddDeviceScreen';
import DevicesScreen from '@/components/Onboarding/ImportFlow/DevicesScreen';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import { AnimatedHeaderTitle, headerOptions, NavHome } from './helpers';
import { Stack } from './Navigator';

const topOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerBackVisible: false,
};

const devicesOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('drawer.label.devices')} />
  ),
  headerBackVisible: false,
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
        options={devicesOptions}
      />
      <Stack.Screen
        name="SyncCode"
        component={RecoveryCodeScreen}
        options={topOptions}
      />
    </>
  );
};

export default Devices;
