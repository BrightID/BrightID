import * as React from 'react';
import { useTranslation } from 'react-i18next';
import OnboardScreen from '@/components/Onboarding/OnboardScreen';
import NameScreen from '@/components/Onboarding/SignUpFlow/NameScreen';
import PhotoScreen from '@/components/Onboarding/SignUpFlow/PhotoScreen';
import PasswordScreen from '@/components/Onboarding/SignUpFlow/PasswordScreen';
import SuccessScreen from '@/components/Onboarding/SignUpFlow/SuccessScreen';
import FormScreen from '@/components/Onboarding/SignUpFlow/FormScreen';
// import SuccessScreen from '@/components/OnboardingRedesigned/SignUpFlow/SuccessScreen';
// import OnboardScreen from '@/components/OnboardingRedesigned/OnboardScreen';

import RecoverInProgressModal from '@/components/Helpers/RecoverInProgressModal';
import { modalOptions } from '@/routes/Modals';
import Restore from './Restore';
import Import from './Import';
import { headerOptions } from './helpers';
import { Stack } from './Navigator';

const Onboarding = () => {
  const { t } = useTranslation();
  return (
    <Stack.Group screenOptions={headerOptions}>
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
