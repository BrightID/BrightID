import React from 'react';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import i18next from 'i18next';
import RecoveringConnectionScreen from '@/components/Onboarding/RecoveryFlow/RecoveringConnectionScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import { headerOptions, AnimatedHeaderTitle } from './helpers';
import { Stack } from './Navigator';

const recoveringScreenOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('restore.header.accountRecovery')} />
  ),
};

const RecoveringConnection = () => {
  return (
    <>
      <Stack.Screen
        name="RecoveringConnection"
        component={RecoveringConnectionScreen}
        options={recoveringScreenOptions}
      />
    </>
  );
};

export default RecoveringConnection;
