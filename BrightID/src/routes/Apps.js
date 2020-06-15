import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppsScreen from '@/components/Apps/AppsScreen';
import { navigate } from '@/NavigationService';
import backArrow from '@/static/back_arrow.svg';
import { TouchableOpacity } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { DEVICE_IOS } from '@/utils/constants';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const topOptions = {
  headerLeft: () => (
    <TouchableOpacity
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
        // marginTop: DEVICE_LARGE ? 15 : 10,
      }}
      onPress={() => {
        navigate('Home');
      }}
    >
      <SvgXml height="20" xml={backArrow} />
    </TouchableOpacity>
  ),
};

const Apps = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Apps"
      component={AppsScreen}
      initialParams={{
        baseUrl: '',
        context: '',
        contextId: '',
      }}
      options={topOptions}
    />
  </Stack.Navigator>
);

export default Apps;
