import React from 'react';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import FullScreenPhoto from '@/components/Helpers/FullScreenPhoto';
import ChangePasswordModal from '@/components/EditProfile/ChangePasswordModal';
import SelectSocialMediaModal from '@/components/EditProfile/SelectSocialMediaModal';

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
        options={modalOptions}
        component={ChangePasswordModal}
      />
      <Stack.Screen
        name="SelectSocialMedia"
        options={modalOptions}
        component={SelectSocialMediaModal}
      />
    </>
  );
};

export default Modals;
