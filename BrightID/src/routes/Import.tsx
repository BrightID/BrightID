import * as React from 'react';
import ImportScreen from '@/components/Onboarding/ImportFlow/ImportScreen';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import { Stack } from './Navigator';

const Import = () => {
  return (
    <>
      <Stack.Screen name="ImportCode" component={RecoveryCodeScreen} />
      <Stack.Screen name="Import" component={ImportScreen} />
    </>
  );
};

export default Import;
