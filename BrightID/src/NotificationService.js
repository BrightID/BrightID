// @flow

import {
  Notification,
  Notifications,
  Registered,
  RegistrationError,
  NotificationCompletion,
  NotificationActionResponse,
  RegisteredPushKit,
} from 'react-native-notifications';
import { DEVICE_IOS, DEVICE_ANDROID } from '@/utils/constants';
import { setDeviceToken, setActiveNotification } from '@/actions';
import { store } from '@/store';
import { navigate } from './NavigationService';

export const notificationSubscription = () => {
  Notifications.registerRemoteNotifications();

  Notifications.events().registerRemoteNotificationsRegistered(
    (event: Registered) => {
      // TODO: Send the token to my server so it could send back push notifications...
      if (event.deviceToken) store.dispatch(setDeviceToken(event.deviceToken));
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
      // console.log('Notification Received - Foreground', notification);
      if (DEVICE_ANDROID) {
        const notificationMsg = {
          title: notification.payload['gcm.notification.title'],
          message: notification.payload['gcm.notification.body'],
        };
        setActiveNotification(notificationMsg);
        console.log(notificationMsg);
      }
      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({ alert: false, sound: true, badge: true });
    },
  );

  Notifications.events().registerNotificationOpened(
    (
      notification: Notification,
      completion: () => void,
      action: NotificationActionResponse,
    ) => {
      console.log('Notification opened by device user', notification.payload);
      console.log(
        `Notification opened with an action identifier: ${action.identifier} and response text: ${action.text}`,
      );
      navigate('Notifications');
      completion();
    },
  );

  Notifications.events().registerNotificationReceivedBackground(
    (
      notification: Notification,
      completion: (response: NotificationCompletion) => void,
    ) => {
      console.log('Notification Received - Background', notification.payload);

      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({ alert: true, sound: true, badge: true });
    },
  );

  if (DEVICE_IOS) {
    Notifications.ios.registerPushKit();

    // Notifications.ios.requestPermissions();

    Notifications.ios.checkPermissions().then((currentPermissions) => {
      console.log(`Badges enabled: ${!!currentPermissions.badge}`);
      console.log(`Sounds enabled: ${!!currentPermissions.sound}`);
      console.log(`Alerts enabled: ${!!currentPermissions.alert}`);
    });

    Notifications.ios
      .events()
      .registerPushKitRegistered((event: RegisteredPushKit) => {
        console.log('PUSHKIT TOKEN', event.pushKitToken);
      });

    Notifications.ios
      .events()
      .registerPushKitNotificationReceived((payload) => {
        console.log(JSON.stringify(payload));
      });
  }
};
