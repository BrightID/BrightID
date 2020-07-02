// @flow

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigate } from '@/NavigationService';

let dropDownAlertRef = null;

export const alertUser = (notification) => {
  dropDownAlertRef?.alertWithType(
    'custom',
    notification.title,
    notification.message,
  );
};

export const NotificationBanner = () => {
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
      messageStyle={styles.message}
      activeStatusBarStyle="dark-content"
      activeStatusBarBackgroundColor="#eee"
      testID="notificationBanner"
      elevation={10}
      zIndex={10}
      onCancel={_onCancel}
      onTap={_onTap}
      onClose={_onClose}
      renderImage={() => (
        <Material
          name="account-alert"
          color="#333"
          size={36}
          style={{ padding: 8, alignSelf: 'center' }}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eee',
    height: 110,
    zIndex: 100,
  },
  // defaultContainer: { alignSelf: 'center' },
  title: {
    fontSize: 18,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'transparent',
  },
  message: {
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: 'transparent',
  },
});

export default NotificationBanner;
