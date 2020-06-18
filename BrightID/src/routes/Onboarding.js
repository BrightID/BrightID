import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from '@/components/OnboardingScreens/Onboard';
import SignUp from '@/components/OnboardingScreens/SignUp';
import { DEVICE_TYPE } from '@/utils/constants';
import Restore from './Restore';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const Onboarding = () => (
  <>
    <Stack.Screen
      name="Onboard"
      component={Onboard}
      options={{ ...headerOptions, headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
      options={{
        ...headerOptions,
        headerShown: DEVICE_TYPE === 'large',
      }}
    />
    <Stack.Screen
      name="Restore"
      component={Restore}
      options={{ ...headerOptions, title: 'Recovery Code' }}
    />
  </>
);

export default Onboarding;
