import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownAlert, {DropdownAlertData} from 'react-native-dropdownalert';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store/hooks';
import { navigate, getRoute } from '@/NavigationService';
import AddGroup from '@/components/Icons/AddGroup';
import AddPerson from '@/components/Icons/AddPerson';
import Certificate from '@/components/Icons/Certificate';
import PhoneLock from '@/components/Icons/PhoneLock';
import { setActiveNotification } from '@/actions';
import { CONNECTIONS_TYPE } from '@/utils/constants';
import { DEVICE_LARGE, HEIGHT } from '@/utils/deviceConstants';
import { LIGHT_GREEN, BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { selectAllUnconfirmedConnections } from '@/components/PendingConnections/pendingConnectionSlice';
import { DetoxEnabled } from '@/utils/Detox';

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
  const { t } = useTranslation();

  const activeNotification = useSelector(
    (state) => state.notifications.activeNotification,
  );
  const pendingConnections = useSelector(selectAllUnconfirmedConnections);

  let alertRef = useRef(
    (_data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res),
  );
  let dismissRef = useRef(() => {});

  useEffect(() => {
    if (!activeNotification) {
      return;
    }

    const route = getRoute();

    if (!screenBlackList.includes(route?.name)) {
      if (!DetoxEnabled) {
        alertRef.current({
          type: 'custom',
          title: activeNotification?.title,
          message: activeNotification?.message,
        })
      }
    }
  }, [activeNotification, dispatch]);

  useEffect(() => {
    if (pendingConnections.length) {
      dispatch(
        setActiveNotification({
          type: CONNECTIONS_TYPE,
          title: t('notificationBar.title.pendingConnection'),
          message: t('notificationBar.text.pendingConnections', {
            count: pendingConnections.length,
          }),
          navigationTarget: 'PendingConnections',
          icon: 'AddPerson',
        }),
      );
    }
  }, [pendingConnections.length, dispatch, t]);

  // icon fallback: activeNotification prop 'icon' -> default icon for notification type -> default 'Certificate'
  const Icon = Icons[activeNotification?.icon || 'Certificate'];

  const _onTap = () => {
    console.log('onTap', activeNotification);
    if (activeNotification?.navigationTarget) {
      navigate(activeNotification.navigationTarget);
    }
    dispatch(setActiveNotification(null));
  };

  return (
    <DropdownAlert
      alert={func => (alertRef.current = func)}
      dismiss={func => (dismissRef.current = func)}
      dismissInterval={NOTIFICATION_TIMEOUT}
      onDismissPress={_onTap}
      renderImage={() => (
        <View style={styles.icon}>
          <Icon
            width={DEVICE_LARGE ? 24 : 20}
            height={DEVICE_LARGE ? 24 : 20}
          />
        </View>
      )}
      zIndex={100}
      safeViewStyle={styles.safeView}
      alertViewStyle={styles.alertView}
      titleTextStyle={styles.title}
      messageTextStyle={styles.message}
      panResponderEnabled={false}
      updateStatusBar={true}
      activeStatusBarBackgroundColor={LIGHT_GREEN}
      activeStatusBarStyle="dark-content"
      elevation={10}
    />
  )
};

const styles = StyleSheet.create({
  safeView: {
    backgroundColor: LIGHT_GREEN,
    height: HEIGHT * 0.15,
    width: '100%',
  },
  alertView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    marginLeft: DEVICE_LARGE ? 20 : 10,
    color: BLACK,
    fontSize: fontSize[16],
  },
  message: {
    fontFamily: 'Poppins-Medium',
    marginLeft: DEVICE_LARGE ? 20 : 10,
    color: BLACK,
    fontSize: fontSize[13],
  },
  icon: {
    marginLeft: DEVICE_LARGE ? 20 : 10,
  },
});

export default NotificationBanner;
