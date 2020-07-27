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
  ...headerOptions,
  headerLeft: () => (
    <TouchableOpacity
      testID="apps-header-back"
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
        // marginTop: DEVICE_LARGE ? 15 : 10,
        padding: 10,
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
);

export default Apps;
