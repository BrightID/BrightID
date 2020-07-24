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

  const myChannel = useSelector(
    (state) => selectChannelById(state, state.channels.myChannelId),
    (a, b) => a?.id === b?.id,
  );
  // pending connections attached to my channel
  const pendingChannelConnections = useSelector(
    (state) => {
      if (myChannel) {
        return selectAllPendingConnections(state).filter(
          (pc) => pc.channelId === myChannel.id,
        );
      } else {
        return [];
      }
    },
    (a, b) => a.length === b.length,
  );

  useEffect(() => {
    console.log('IN DAT EFFECT');
    if (
      myChannel?.type === channel_types.GROUP &&
      pendingChannelConnections.length > 0
    ) {
      dispatch(
        setActiveNotification({
          message: `You have ${pendingChannelConnections.length} pending Connections`,
          type: CONNECTIONS_TYPE,
        }),
      );
    }
  }, [myChannel, pendingChannelConnections.length, dispatch]);

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

    if (activeNotification?.type === CONNECTIONS_TYPE) {
      navigate('PendingConnections');
    } else {
      navigate('Notifications', { type: activeNotification?.type });
    }
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
        <SvgXml
          style={styles.icon}
          xml={icon}
          width={DEVICE_LARGE ? 24 : 20}
          height={DEVICE_LARGE ? 24 : 20}
        />
      )}
      panResponderEnabled={
        activeNotification?.type !== CONNECTIONS_TYPE || __DEV__
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#AFFDD0',
    height: DEVICE_LARGE ? 142 : 98,
  },
  title: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginLeft: 20,
    color: '#000',
    fontSize: DEVICE_LARGE ? 13 : 12,
  },
  icon: {
    marginLeft: 35,
  },
});

export default NotificationBanner;
