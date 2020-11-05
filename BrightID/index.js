import 'react-native-gesture-handler';
import './i18n';
// import { enableScreens } from 'react-native-screens';
import { AppRegistry, FlatList, Text, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { DEVICE_IOS } from '@/utils/constants';

import codePush from 'react-native-code-push';
import codePushOptions from './codepush.config.js';
import App from './src/App';
import { name as appName } from './app.json';

// detox e2e tests fail when yellowboxes come up
console.disableYellowBox = true;

// enable react-native-screens
// enableScreens is causing some android devices to crash
// enable screens might be causing ios swipe navigation to freeze
// enableScreens();

// Bootstrap fonts
Ionicons.loadFont();
SimpleLineIcons.loadFont();
MaterialCommunityIcons.loadFont();
Octicons.loadFont();
AntDesign.loadFont();

// Fix Font Scaling
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

FlatList.defaultProps = FlatList.defaultProps || {};
FlatList.defaultProps.windowSize = 5;

AppRegistry.registerComponent(appName, () => codePush(codePushOptions)(App));
