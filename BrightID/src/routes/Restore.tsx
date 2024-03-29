import * as React from 'react';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import RestoreScreen from '@/components/Onboarding/RecoveryFlow/RestoreScreen';
import { Stack } from './Navigator';

const Restore = () => {
  return (
    <>
      <Stack.Screen name="RecoveryCode" component={RecoveryCodeScreen} />
      <Stack.Screen name="Restore" component={RestoreScreen} />
    </>
  );
};

export default Restore;
