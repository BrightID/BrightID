import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import { useTranslation } from 'react-i18next';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';
import RestoreScreen from '@/components/Onboarding/RecoveryFlow/RestoreScreen';

const Stack = createStackNavigator();

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
