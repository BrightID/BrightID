// @flow

import React, { useCallback, useEffect, useRef } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { navigate } from '@/NavigationService';
import groups from '@/static/add_group.svg';
import connections from '@/static/add_person.svg';
import misc from '@/static/trusted_connections.svg';
import { setActiveNotification } from '@/actions';
import { DEVICE_ANDROID } from '@/utils/constants';

/* notification types: 
@type groups
@type connections
@type misc
*/

const icons = { groups, connections, misc };

export const NotificationBanner = () => {
  const dispatch = useDispatch();
  const dropDownAlertRef = useRef(null);
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
    shallowEqual,
  );

  useEffect(() => {
    if (!activeNotification) return;

    dropDownAlertRef.current?.alertWithType(
      'custom',
      activeNotification?.message,
    );

    if (DEVICE_ANDROID) {
      StatusBar.setBackgroundColor('#AFFDD0', true);
    }
  }, [activeNotification]);

  // update default icon
  const icon = icons[activeNotification?.type] ?? misc;

  const _onTap = useCallback(() => {
    if (DEVICE_ANDROID) {
      StatusBar.setBackgroundColor('#fff', true);
    }
    navigate('Notifications', { type: activeNotification?.type });
  }, [activeNotification]);

  const _onClose = () => {
    if (DEVICE_ANDROID) {
      StatusBar.setBackgroundColor('#fff', true);
    }
    dispatch(setActiveNotification(null));
  };

  return (
    <DropdownAlert
      ref={dropDownAlertRef}
      closeInterval={0}
      containerStyle={styles.container}
      contentContainerStyle={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      titleStyle={styles.title}
      updateStatusBar={false}
      testID="notificationBanner"
      elevation={10}
      zIndex={100}
      onTap={_onTap}
      onClose={_onClose}
      renderImage={() => (
        <SvgXml style={styles.icon} xml={icon} width={24} height={24} />
      )}
      panResponderEnabled={activeNotification?.type !== 'newConnection'}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AFFDD0',
    height: 142,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginLeft: 20,
    color: '#000',
    fontSize: 13,
  },
  icon: {
    marginLeft: 35,
  },
});

export default NotificationBanner;
