// @flow

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { shallowEqual, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { navigate } from '@/NavigationService';
import groupInvite from '@/static/add_group.svg';
import newConnection from '@/static/add_person.svg';
import trustedConnections from '@/static/trusted_connections.svg';

let dropDownAlertRef = null;

const _onClose = (data) => {
  console.log('close');
  console.log(data);
};
const _onCancel = (data) => {
  console.log('cancel');
  console.log(data);
};
const _onTap = (data) => {
  console.log('tapped');
  console.log(data);
  navigate('Notifications');
};

const icons = { groupInvite, newConnection, trustedConnections };

export const NotificationBanner = () => {
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
    shallowEqual,
  );

  useEffect(() => {
    dropDownAlertRef?.alertWithType('custom', activeNotification.message);
  }, [activeNotification]);

  // update default icon
  const icon = icons[activeNotification?.type] ?? trustedConnections;

  return (
    <DropdownAlert
      ref={(ref) => {
        dropDownAlertRef = ref;
      }}
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
