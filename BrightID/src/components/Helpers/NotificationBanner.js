// @flow

import React, { useCallback, useEffect, useRef } from 'react';
import { InteractionManager, StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { navigate, getRoute } from '@/NavigationService';
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
  selectAllUnconfirmedConnections,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';

/* notification types: 
@type groups
@type connections
@type misc
*/

const icons = { groups, connections, misc };

const NOTIFICATION_TIMEOUT = 10000;

const screenBlackList = ['ScanCode', 'PendingConnections'];

export const NotificationBanner = () => {
  const dispatch = useDispatch();

  // const route = useRoute();
  const dropDownAlertRef = useRef(null);
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
  );

  const pendingConnections = useSelector(selectAllUnconfirmedConnections);

  useEffect(() => {
    console.log('IN THE BANNER EFFECT');
    dropDownAlertRef.current?.closeAction('automatic');
    if (!activeNotification) {
      return;
    }

    let timer;

    InteractionManager.runAfterInteractions(() => {
      let route = getRoute();
      if (!screenBlackList.includes(route?.name)) {
        dropDownAlertRef.current?.alertWithType(
          'custom',
          activeNotification?.message,
        );
        // automatically close banner after timeout
        timer = setTimeout(() => {
          dropDownAlertRef.current?.closeAction('automatic');
        }, NOTIFICATION_TIMEOUT);
      }
    });

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [activeNotification, dispatch]);

  useEffect(() => {
    // always close the banner first
    // dropDownAlertRef.current?.closeAction('automatic');
    console.log('Pending length', pendingConnections.length);

    if (pendingConnections.length) {
      dispatch(
        setActiveNotification({
          type: CONNECTIONS_TYPE,
          message: `You have ${pendingConnections.length} pending connection${
            pendingConnections.length > 1 ? 's' : ''
          }`,
        }),
      );
    }
  }, [pendingConnections.length, dispatch]);

  // update default icon
  const icon = icons[activeNotification?.type] ?? misc;

  const _onTap = () => {
    if (activeNotification?.type === CONNECTIONS_TYPE) {
      navigate('PendingConnections');
    } else {
      navigate('Notifications', { type: activeNotification?.type });
    }
  };

  const _onClose = () => {
    console.log('_onClose');
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
