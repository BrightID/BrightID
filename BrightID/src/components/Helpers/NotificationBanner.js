// @flow

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { useSelector, useDispatch } from 'react-redux';
import { navigate, getRoute } from '@/NavigationService';
import AddGroup from '@/components/Icons/AddGroup';
import AddPerson from '@/components/Icons/AddPerson';
import Certificate from '@/components/Icons/Certificate';
import PhoneLock from '@/components/Icons/PhoneLock';
import { setActiveNotification } from '@/actions';
import { CONNECTIONS_TYPE, GROUPS_TYPE, MISC_TYPE } from '@/utils/constants';
import { DEVICE_LARGE, HEIGHT } from '@/utils/deviceConstants';

import { selectAllUnconfirmedConnections } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import DropDownAlertEnabled from '@/utils/DropDownAlertEnabler';

/* notification types:
@type groups
@type connections
@type misc
*/

// default icons
const Icons = {
  AddGroup,
  AddPerson,
  PhoneLock,
  Certificate,
};

const NOTIFICATION_TIMEOUT = 10000;

const screenBlackList = [
  'ScanCode',
  'PendingConnections',
  'MyCode',
  'GroupConnection',
];

export const NotificationBanner = () => {
  const dispatch = useDispatch();

  // const route = useRoute();
  const dropDownAlertRef = useRef(null);
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
  );

  const pendingConnections = useSelector(selectAllUnconfirmedConnections);

  useEffect(() => {
    if (!activeNotification) {
      return;
    }

    let route = getRoute();

    dropDownAlertRef.current?.closeAction('cancel');

    if (!screenBlackList.includes(route?.name)) {
      if (DropDownAlertEnabled) {
        dropDownAlertRef.current?.alertWithType(
          'custom',
          activeNotification?.title,
          activeNotification?.message,
        );
      }
    }
  }, [activeNotification, dispatch]);

  useEffect(() => {
    // always close the banner first
    // dropDownAlertRef.current?.closeAction('automatic');

    if (pendingConnections.length) {
      dispatch(
        setActiveNotification({
          type: CONNECTIONS_TYPE,
          title: 'Confirm connections',
          message: `You have ${pendingConnections.length} pending connection${
            pendingConnections.length > 1 ? 's' : ''
          }`,
          navigationTarget: 'PendingConnections',
          icon: 'AddPerson',
        }),
      );
    }
  }, [pendingConnections.length, dispatch]);

  // icon fallback: activeNotification prop 'icon' -> default icon for notification type -> default 'Certificate'
  const Icon = Icons[activeNotification?.icon || 'Certificate'];

  const _onTap = () => {
    console.log('onTap', activeNotification);
    if (activeNotification?.navigationTarget) {
      navigate(activeNotification.navigationTarget);
    }
  };

  const _onClose = () => {
    console.log('onClose, setting null');
    dispatch(setActiveNotification(null));
  };

  return (
    <DropdownAlert
      ref={dropDownAlertRef}
      closeInterval={NOTIFICATION_TIMEOUT}
      containerStyle={styles.container}
      contentContainerStyle={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      titleStyle={styles.title}
      messageStyle={styles.message}
      updateStatusBar={true}
      activeStatusBarBackgroundColor="#AFFDD0"
      activeStatusBarStyle="dark-content"
      testID="notificationBanner"
      elevation={10}
      zIndex={100}
      onTap={_onTap}
      onClose={_onClose}
      renderImage={() => (
        <View style={styles.icon}>
          <Icon
            width={DEVICE_LARGE ? 24 : 20}
            height={DEVICE_LARGE ? 24 : 20}
          />
        </View>
      )}
      panResponderEnabled={false}
      tapToCloseEnabled={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AFFDD0',
    height: HEIGHT * 0.15,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    marginLeft: DEVICE_LARGE ? 20 : 10,
    color: '#000',
    fontSize: DEVICE_LARGE ? 16 : 15,
  },
  message: {
    fontFamily: 'Poppins-Medium',
    marginLeft: DEVICE_LARGE ? 20 : 10,
    color: '#000',
    fontSize: DEVICE_LARGE ? 13 : 12,
  },
  icon: {
    marginLeft: DEVICE_LARGE ? 20 : 10,
  },
});

export default NotificationBanner;
