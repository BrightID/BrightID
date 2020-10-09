import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Onboard from '@/components/OnboardingScreens/Onboard';
import SignUp from '@/components/OnboardingScreens/SignUp';
import Restore from './Restore';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const Onboarding = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Onboard"
        component={Onboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp"
        component={SignUp}
        options={{ title: t('signup.header.title') }} />
      <Stack.Screen
        name="Restore"
        component={Restore}
        options={{ title: t('recovery.header.title') }}
      />
    </Stack.Navigator>
  );
}

export default Onboarding;
