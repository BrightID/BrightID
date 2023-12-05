import * as React from 'react';
// import { useTranslation } from 'react-i18next';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
// import RecoveryCodeScreen from '@/components/OnboardingRedesigned/RecoveryFlow/RecoveryCodeScreen';
import RestoreScreen from '@/components/Onboarding/RecoveryFlow/RestoreScreen';
// import RestoreScreen from '@/components/OnboardingRedesigned/RecoveryFlow/RestoreScreen';
import { Stack } from './Navigator';

const Restore = () => {
  // const { t } = useTranslation();
  return (
    <>
      <Stack.Screen name="RecoveryCode" component={RecoveryCodeScreen} />
      <Stack.Screen name="Restore" component={RestoreScreen} />
    </>
  );
};

export default Restore;
