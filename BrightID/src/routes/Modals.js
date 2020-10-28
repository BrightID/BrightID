import React from 'react';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import FullScreenPhoto from '@/components/Helpers/FullScreenPhoto';
import ChangePasswordModal from '@/components/SideMenu/ChangePasswordModal';

const Stack = createStackNavigator();

const modalOptions = {
  headerShown: false,
  cardOverlayEnabled: true,
  mode: 'modal',
  gestureEnabled: true,
  ...TransitionPresets.FadeFromBottomAndroid,
  cardStyle: { backgroundColor: 'transparent' },
};

const Modals = () => {
  return (
    <>
      <Stack.Screen
        name="FullScreenPhoto"
        component={FullScreenPhoto}
        options={modalOptions}
      />
      <Stack.Screen
        name="ChangePassword"
        options={{
          headerShown: false,
          cardOverlayEnabled: true,
          mode: 'modal',
          gestureEnabled: true,
          ...TransitionPresets.FadeFromBottomAndroid,
          cardStyle: { backgroundColor: 'transparent' },
        }}
        component={ChangePasswordModal}
      />
    </>
  );
};

export default Modals;
