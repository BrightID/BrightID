import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Onboard from '@/components/OnboardingScreens/Onboard';
import SignUp from '@/components/OnboardingScreens/SignUp';
import Restore from './Restore';

const Stack = createStackNavigator();

const Onboarding = () => (
  <Stack.Navigator screenOptions={{}}>
    <Stack.Screen
      name="Onboard"
      component={Onboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
      options={{ headerBackTitleVisible: false }}
    />
    <Stack.Screen name="Restore" component={Restore} />
  </Stack.Navigator>
);

export default Onboarding;
