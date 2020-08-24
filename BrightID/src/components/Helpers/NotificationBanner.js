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
import {
  DEVICE_ANDROID,
  DEVICE_LARGE,
  CONNECTIONS_TYPE,
  HEIGHT,
  DEVICE_IOS,
} from '@/utils/constants';
import {
  // channel_states,
  channel_types,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import {
  // pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';

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
  }, [activeNotification]);

  // update default icon
  const icon = icons[activeNotification?.type] ?? misc;

  const _onTap = useCallback(() => {
    if (activeNotification?.type === CONNECTIONS_TYPE) {
      navigate('PendingConnections');
    } else {
      navigate('Notifications', { type: activeNotification?.type });
    }
  }, [activeNotification]);

  const _onClose = () => {
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
      updateStatusBar={true}
      activeStatusBarBackgroundColor="#AFFDD0"
      activeStatusBarStyle="dark-content"
      testID="notificationBanner"
      elevation={10}
      zIndex={100}
      onTap={_onTap}
      onClose={_onClose}
      renderImage={() => (
        <SvgXml
          style={styles.icon}
          xml={icon}
          width={DEVICE_LARGE ? 24 : 20}
          height={DEVICE_LARGE ? 24 : 20}
        />
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
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginLeft: DEVICE_LARGE ? 20 : 10,
    color: '#000',
    fontSize: DEVICE_LARGE ? 13 : 12,
  },
  icon: {
    marginLeft: DEVICE_LARGE ? 35 : 10,
  },
});

export default NotificationBanner;
