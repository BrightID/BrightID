import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Eula from '@/components/OnboardingScreens/Eula';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const EulaStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen
        name="LicenseAgreement"
        component={Eula}
        options={{
          title: t('eula.header.title'),
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
};

export default EulaStack;
