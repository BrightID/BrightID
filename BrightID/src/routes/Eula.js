import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import Eula from '@/components/OnboardingScreens/Eula';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

export const headerTitleStyle = {
  fontFamily: 'Poppins-Medium',
  fontSize: DEVICE_LARGE ? 20 : 17,
  color: '#000',
};

export const headerOptions = {
  headerTitleStyle,
  headerTintColor: '#000',
  headerTitleAlign: 'left',
  headerBackTitleVisible: false,
};

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
