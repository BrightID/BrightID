import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecoveryCodeScreen from '@/components/Recovery/RecoveryCodeScreen';
import RestoreScreen from '@/components/Recovery/RestoreScreen';

const Stack = createStackNavigator();

const Restore = () => (
  <>
    <Stack.Screen name="RecoveryCode" component={RecoveryCodeScreen} />
    <Stack.Screen name="Restore" component={RestoreScreen} />
  </>
);

export default Restore;
