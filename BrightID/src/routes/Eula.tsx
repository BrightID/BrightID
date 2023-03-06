import React from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Eula from '@/components/Onboarding/Eula';
import { fontSize } from '@/theme/fonts';
import { BLACK } from '@/theme/colors';
import { Stack } from './Navigator';

export const headerTitleStyle = {
  fontFamily: 'Poppins-Medium',
  fontSize: fontSize[20],
  color: BLACK,
};

export const headerOptions: NativeStackNavigationOptions = {
  headerTitleStyle,
  headerTintColor: BLACK,
  headerTitleAlign: 'left',
  headerBackTitleVisible: false,
};

const EulaStack = (eula: boolean) => {
  const { t } = useTranslation();
  return (
    <Stack.Group
      navigationKey={eula ? 'yes' : 'no'}
      screenOptions={headerOptions}
    >
      <Stack.Screen
        name="LicenseAgreement"
        component={Eula}
        options={{
          title: t('eula.header.title'),
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Group>
  );
};

export default EulaStack;
