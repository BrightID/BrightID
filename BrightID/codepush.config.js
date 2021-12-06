import codePush from 'react-native-code-push';

export default {
  checkFrequency: __DEV__
    ? codePush.CheckFrequency.MANUAL
    : codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
  rollbackRetryOptions: {
    delayInHours: 1,
    maxRetryAttempts: 12,
  },
};
