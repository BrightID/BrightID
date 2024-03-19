import * as React from 'react';
import { useTranslation } from 'react-i18next';
import OnboardScreen from '@/components/Onboarding/OnboardScreen';
import SuccessScreen from '@/components/Onboarding/SignUpFlow/SuccessScreen';
import FormScreen from '@/components/Onboarding/SignUpFlow/FormScreen';

import Restore from './Restore';
import Import from './Import';
import { onboardHeaderOptions } from './helpers';
import { Stack } from './Navigator';

const Onboarding = () => {
  const { t } = useTranslation();
  return (
    <Stack.Group screenOptions={onboardHeaderOptions}>
      <Stack.Screen
        name="Onboard"
        component={OnboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignupName"
        component={FormScreen}
        options={{ title: t('signup.header.title') }}
      />
      <Stack.Screen
        name="OnboardSuccess"
        component={SuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Group
        screenOptions={{ title: t('restore.header.accountRecovery') }}
      >
        {Restore()}
      </Stack.Group>
      <Stack.Group screenOptions={{ title: t('import.header.title') }}>
        {Import()}
      </Stack.Group>
    </Stack.Group>
  );
};

export default Onboarding;
