import * as React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
import i18next from 'i18next';
import AddDeviceScreen from '@/components/Onboarding/ImportFlow/AddDeviceScreen';
import DevicesScreen from '@/components/Onboarding/ImportFlow/DevicesScreen';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import { AnimatedHeaderTitle, headerOptions, NavHome } from './helpers';
import { Stack } from './Navigator';

const topOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
};

const devicesOptions: StackNavigationOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('drawer.label.devices')} />
  ),
};

const Devices = () => {
  return (
    <>
      <Stack.Screen
        name="AddDevice"
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
