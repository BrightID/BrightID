import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import RecoveringConnectionScreen from '@/components/Onboarding/RecoveryFlow/RecoveringConnectionScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import i18next from 'i18next';
import { headerOptions, AnimatedHeaderTitle } from './helpers';

const Stack = createStackNavigator();

const recoveringScreenOptions: StackNavigationOptions = {
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
