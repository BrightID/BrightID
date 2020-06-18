import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from '@/components/OnboardingScreens/Onboard';
import SignUp from '@/components/OnboardingScreens/SignUp';
import { DEVICE_TYPE } from '@/utils/constants';
import Restore from './Restore';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const Onboarding = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Onboard"
      component={Onboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
      options={{
        headerShown: DEVICE_TYPE === 'large',
      }}
    />
    <Stack.Screen
      name="Restore"
      component={Restore}
      options={{ title: 'Recovery Code' }}
    />
  </Stack.Navigator>
);

export default Onboarding;
