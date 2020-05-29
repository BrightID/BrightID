// @flow

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

export const NotificationBanner = ({ msg }: { msg: string }) => {
  let dropDownAlertRef = useRef(null);
  useEffect(() => {
    // Animated.timing(fadeAnim, {
    //   toValue: 1,
    //   duration: 10000,
    // }).start();
    dropDownAlertRef.alertWithType(
      'custom',
      'New Connection',
      'You have one new connection request',
    );
  }, []);

  const close = () => {
    dropDownAlertRef.closeAction();
  };

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
  };

  return (
    <View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eee',
    height: 110,
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
