import 'react-native-gesture-handler';
import './src/i18n';
// import { enableScreens } from 'react-native-screens';
// import { enableFreeze } from 'react-native-screens';
import { AppRegistry, FlatList, Text, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { DEVICE_ANDROID } from '@/utils/deviceConstants.ts';
import App from './src/App.tsx';
import { name as appName } from './app.json';
import { currentLogName, LOG } from './src/utils/logging';

// detox e2e tests fail when yellowboxes come up
console.disableYellowBox = true;

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

// enable react-native-screens
// enableScreens is causing some android devices to crash
// enable screens might be causing ios swipe navigation to freeze
// this disables react-native-screen
// enableScreens(false);
// enableFreeze(true);

// Bootstrap fonts
Ionicons.loadFont().catch((err) => console.log(err));
SimpleLineIcons.loadFont().catch((err) => console.log(err));
MaterialCommunityIcons.loadFont().catch((err) => console.log(err));
Octicons.loadFont().catch((err) => console.log(err));
AntDesign.loadFont().catch((err) => console.log(err));
MaterialIcons.loadFont().catch((err) => console.log(err));

// Fix Font Scaling

Text.defaultProps = Text.defaultProps || {};

Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};

TextInput.defaultProps.allowFontScaling = false;

FlatList.defaultProps = FlatList.defaultProps || {};

FlatList.defaultProps.windowSize = DEVICE_ANDROID ? 5 : 10;

FlatList.defaultProps.removeClippedSubviews = DEVICE_ANDROID;

AppRegistry.registerComponent(appName, () => App);
