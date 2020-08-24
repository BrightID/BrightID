// @flow

import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
  NotificationCompletion,
  NotificationActionResponse,
} from 'react-native-notifications';
import { DEVICE_IOS, DEVICE_ANDROID } from '@/utils/constants';
import {
  setDeviceToken,
  setActiveNotification,
  setNotificationToken,
} from '@/actions';
import { store } from '@/store';
import notificationService from '@/api/notificationService';
import { navigate } from './NavigationService';

export const notificationSubscription = () => {
  Notifications.registerRemoteNotifications();

  Notifications.events().registerRemoteNotificationsRegistered(
    (event: Registered) => {
      // TODO: Send the token to my server so it could send back push notifications...
      const { notifications } = store.getState();

      if (
        !notifications.notificationToken ||
        !notifications.deviceToken ||
        (event.deviceToken && event.deviceToken !== notifications.deviceToken)
      ) {
        notificationService
          .getToken(event.deviceToken)
          .then(({ notificationToken }) => {
            store.dispatch(setNotificationToken(notificationToken));
          })
          .catch((err) => {
            console.log(err.message);
          });
        store.dispatch(setDeviceToken(event.deviceToken));
      }

      console.log('RECIEVED_NOTIFICATION_TOKEN', event.deviceToken);
    },
  );
  Notifications.events().registerRemoteNotificationsRegistrationFailed(
    (event: RegistrationError) => {
      console.error('registration error', event);
    },
  );

  Notifications.events().registerNotificationReceivedForeground(
    (
      notification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      console.log('Notification Received - Foreground', notification);

      completion({ alert: false, sound: true, badge: true });
    },
  );

  Notifications.events().registerNotificationOpened(
    (
      notification: Notification,
      completion: () => void,
      action: NotificationActionResponse,
    ) => {
      navigate('Notifications', { type: notification.payload?.type });
      completion();
    },
  );

  Notifications.events().registerNotificationReceivedBackground(
    (
      notification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      console.log('Notification Received - Background', notification.payload);
      completion({ alert: true, sound: true, badge: true });
    },
  );
};
