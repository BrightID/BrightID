import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// import { useTranslation } from 'react-i18next';
import ImportScreen from '@/components/Onboarding/ImportFlow/ImportScreen';
import RecoveryCodeScreen from '@/components/Onboarding/RecoveryFlow/RecoveryCodeScreen';


const Stack = createStackNavigator();

const Import = () => {
  // const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ImportCode" component={RecoveryCodeScreen} />
      <Stack.Screen name="Import" component={ImportScreen} />
    </Stack.Navigator>
  );
};

export default Import;
