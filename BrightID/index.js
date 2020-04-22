/** @format */

import 'react-native-gesture-handler';
import { AppRegistry, Text, TextInput } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import App from './src/App';
import { name as appName } from './app.json';

// enable react-native-screen
enableScreens();

// Bootstrap fonts
Ionicons.loadFont();
SimpleLineIcons.loadFont();
MaterialIcons.loadFont();
MaterialCommunityIcons.loadFont();
Octicons.loadFont();
AntDesign.loadFont();

// Fix Warning Messages
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

AppRegistry.registerComponent(appName, () => App);
