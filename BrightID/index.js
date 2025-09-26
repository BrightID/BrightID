import 'react-native-gesture-handler';
import './src/i18n';
import 'fast-text-encoding';
import 'react-native-url-polyfill/auto';
import { AppRegistry, FlatList, LogBox, Text, TextInput } from 'react-native';
import { DEVICE_ANDROID } from '@/utils/deviceConstants.ts';
import App from './src/App.tsx';
import { name as appName } from './app.json';
import { currentLogName, LOG } from './src/utils/logging';
import DetoxEnabled from './src/utils/Detox';

// detox e2e tests fail when logboxes come up
if (DetoxEnabled) {
  LogBox.ignoreAllLogs();
}


// remove setting a timer warning
if (__DEV__) {
  const _ = require('lodash');
  const _console = _.clone(console);
  console.warn = (message) => {
    if (message.indexOf('Setting a timer') <= -1) {
      _console.warn(message);
    }
  };
}

// route all console.log() to logger
LOG.patchConsole();
LOG.info(`Start logging to ${currentLogName}.`);

// Bootstrap fonts

// Fix Font Scaling

Text.defaultProps = Text.defaultProps || {};

Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};

TextInput.defaultProps.allowFontScaling = false;

FlatList.defaultProps = FlatList.defaultProps || {};

FlatList.defaultProps.windowSize = DEVICE_ANDROID ? 5 : 10;

FlatList.defaultProps.removeClippedSubviews = DEVICE_ANDROID;

AppRegistry.registerComponent(appName, () => App);
