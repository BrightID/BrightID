// @flow

import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { shallowEqual, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { navigate } from '@/NavigationService';
import groups from '@/static/add_group.svg';
import connections from '@/static/add_person.svg';
import misc from '@/static/trusted_connections.svg';

/* notification types: 
@type groups
@type connections
@type misc
*/

const icons = { groups, connections, misc };

const _onClose = (data) => {
  console.log('close');
  console.log(data);
};
const _onCancel = (data) => {
  console.log('cancel');
  console.log(data);
};

export const NotificationBanner = () => {
  const dropDownAlertRef = useRef(null);
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
    shallowEqual,
  );

  useEffect(() => {
    dropDownAlertRef.current?.alertWithType(
      'custom',
      activeNotification.message,
    );
  }, [activeNotification]);

  // update default icon
  const icon = icons[activeNotification?.type] ?? misc;

  const _onTap = useCallback(() => {
    navigate('Notifications', { type: activeNotification.type });
  }, [activeNotification.type]);

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
      activeStatusBarStyle="dark-content"
      activeStatusBarBackgroundColor="'#AFFDD0"
      testID="notificationBanner"
      elevation={10}
      zIndex={100}
      onCancel={_onCancel}
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
