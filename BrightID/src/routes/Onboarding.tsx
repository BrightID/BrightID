import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import OnboardScreen from '@/components/Onboarding/OnboardScreen';
import NameScreen from '@/components/Onboarding/SignUpFlow/NameScreen';
import PhotoScreen from '@/components/Onboarding/SignUpFlow/PhotoScreen';
import PasswordScreen from '@/components/Onboarding/SignUpFlow/PasswordScreen';
import SuccessScreen from '@/components/Onboarding/SignUpFlow/SuccessScreen';

import Restore from './Restore';
import Import from './Import';
import { headerOptions } from './helpers';
import RecoverInProgressModal from '@/components/Helpers/RecoverInProgressModal';
import { modalOptions } from '@/routes/Modals';

const Stack = createStackNavigator();

const Onboarding = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="Onboard"
        component={OnboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignupName"
        component={NameScreen}
        options={{ title: t('signup.header.title') }}
      />
      <Stack.Screen
        name="SignUpPhoto"
        component={PhotoScreen}
        options={{ title: t('signup.header.title') }}
      />
      <Stack.Screen
        name="SignUpPassword"
        component={PasswordScreen}
        options={{ title: t('signup.header.title') }}
      />
      <Stack.Screen
        name="OnboardSuccess"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Restore"
        component={Restore}
        options={{ title: t('restore.header.accountRecovery') }}
      />
      <Stack.Screen
        name="Import"
        component={Import}
        options={{ title: t('import.header.title') }}
      />
      <Stack.Screen
        name="RecoverInProgress"
        options={modalOptions}
        component={RecoverInProgressModal}
      />
    </Stack.Navigator>
  );
};

export default Onboarding;
