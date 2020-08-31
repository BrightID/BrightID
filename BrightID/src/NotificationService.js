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
      const { notifications } = store.getState();

      if (event.deviceToken) {
        // always update the server with our device token.
        // if notificationToken exists, then our connections already have it
        // so we need to make sure that the notification server is also synced

        let oldDeviceToken =
          notifications.deviceToken &&
          notifications.deviceToken !== event.deviceToken
            ? notifications.deviceToken
            : null;

        notificationService
          .getToken({
            deviceToken: event.deviceToken,
            notificationToken: notifications.notificationToken,
            oldDeviceToken,
          })
          .then(({ notificationToken }) => {
            if (
              notificationToken &&
              notificationToken !== notifications.notificationToken
            )
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
