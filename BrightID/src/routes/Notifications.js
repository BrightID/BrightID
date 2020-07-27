import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NotificationsScreen from '@/components/Notifications/NotificationsScreen';

import BackupScreen from '@/components/Recovery/BackupScreen';
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
      testID="notifications-header-back"
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

const Notifications = () => (
  <>
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={topOptions}
    />

    <Stack.Screen
      name="Backup"
      component={BackupScreen}
      options={headerOptions}
    />
  </>
);

export default Notifications;
