// @flow

import React, { useEffect, useRef } from 'react';
import { InteractionManager, StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import { useSelector, useDispatch } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { navigate, getRoute } from '@/NavigationService';
import { useTranslation } from 'react-i18next';
import groups from '@/static/add_group.svg';
import connections from '@/static/add_person.svg';
import misc from '@/static/trusted_connections.svg';
import { setActiveNotification } from '@/actions';
import { DEVICE_LARGE, CONNECTIONS_TYPE, HEIGHT } from '@/utils/constants';
import { selectAllUnconfirmedConnections } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import DropDownAlertEnabled from '@/utils/DropDownAlertEnabler';

/* notification types:
@type groups
@type connections
@type misc
*/

// default icons
const icons = { connections, groups, misc };

const NOTIFICATION_TIMEOUT = 10000;

const screenBlackList = [
  'ScanCode',
  'PendingConnections',
  'MyCode',
  'GroupConnection',
];

export const NotificationBanner = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // const route = useRoute();
  const dropDownAlertRef = useRef(null);
  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
  );

  const pendingConnections = useSelector(selectAllUnconfirmedConnections);

  useEffect(() => {
    dropDownAlertRef.current?.closeAction('automatic');
    if (!activeNotification) {
      return;
    }

    InteractionManager.runAfterInteractions(() => {
      let route = getRoute();
      if (!screenBlackList.includes(route?.name)) {
        if (DropDownAlertEnabled) {
          dropDownAlertRef.current?.alertWithType(
            'custom',
            activeNotification?.title,
            activeNotification?.message,
          );
        }
      }
    });
  }, [activeNotification, dispatch]);

  useEffect(() => {
    // always close the banner first
    // dropDownAlertRef.current?.closeAction('automatic');

    if (pendingConnections.length) {
      dispatch(
        setActiveNotification({
          type: CONNECTIONS_TYPE,
          title: t('notificationBar.title.pendingConnection'),
          message: t('notificationBar.text.pendingConnections', {count: pendingConnections.length}),
          navigationTarget: 'PendingConnections',
        }),
      );
    }
  }, [pendingConnections.length, dispatch]);

  // icon fallback: activeNotification prop 'xmlIcon' -> default icon for notification type -> default 'misc'
  const icon =
    activeNotification?.xmlIcon ?? icons[activeNotification?.type] ?? misc;

  const _onTap = () => {
    if (activeNotification?.navigationTarget) {
      navigate(activeNotification.navigationTarget);
    }
  };

  const _onClose = () => {
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
    fontSize: DEVICE_LARGE ? 16 : 15,
  },
  message: {
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
