import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DEVICE_TYPE } from '@/utils/constants';
import Onboard from '@/components/OnboardingScreens/Onboard';
import SignUp from '@/components/OnboardingScreens/SignUp';
import Restore from './Restore';

const Stack = createStackNavigator();

const signUpScreenOptions = {
  title: 'BrightID',
  // headerStyle: {
  //   backgroundColor: '#f48b1e',
  // },
  // eslint-disable-next-line react/display-name
  headerRight: () => (
    <TouchableOpacity style={{ marginRight: 11 }}>
      <Ionicons name="ios-help-circle-outline" size={32} color="#fff" />
    </TouchableOpacity>
  ),
  headerShown: DEVICE_TYPE === 'large',
};

const Onboarding = () => (
  <Stack.Navigator screenOptions={{}}>
    <Stack.Screen
      name="Onboard"
      component={Onboard}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SignUp"
      component={SignUp}
      options={{ headerBackTitleVisible: false }}
    />
    <Stack.Screen name="Restore" component={Restore} />
  </Stack.Navigator>
);

export default Onboarding;
