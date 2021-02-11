import PushNotificationIOS from '@react-native-community/push-notification-ios';
import * as PushNotification from 'react-native-push-notification';
import { setDeviceToken, setNotificationToken } from '@/actions';
import { store } from '@/store';
import notificationService from '@/api/notificationService';

export function notificationSubscription() {
  // Must be outside of any component LifeCycle (such as `componentDidMount`).
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister({ token }) {
      const { notifications } = store.getState();

      if (token) {
        console.log('RECIEVED_NOTIFICATION_TOKEN', token);
        // always update the server with our device token.
        // if notificationToken exists, then our connections already have it
        // so we need to make sure that the notification server is also synced

        let oldDeviceToken =
          notifications.deviceToken && notifications.deviceToken !== token
            ? notifications.deviceToken
            : null;

        notificationService
          .getToken({
            deviceToken: token,
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
        store.dispatch(setDeviceToken(token));
      }
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification(notification) {
      console.log('NOTIFICATION:', notification);

      // process the notification

      // (required) Called when a remote is received or opened, or local notification is opened
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction(notification) {
      console.log('ACTION:', notification.action);
      console.log('NOTIFICATION:', notification);

      // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError(err) {
      console.error(err.message, err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
  });

  PushNotification.createChannel(
    {
      channelId: 'brightid-main', // (required)
      channelName: 'Brightid Main', // (required)
      channelDescription: 'A channel to recieve BrightID notifications', // (optional) default: undefined.
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    },
    (created) => console.log(`createChannel returned '${created}'`), // (optional) callback returns whether the channel was created, false means it already existed.
  );
}