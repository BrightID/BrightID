import 'react-native-gesture-handler';
import { AppRegistry, FlatList, Text, TextInput } from 'react-native';
import { enableScreens } from 'react-native-screens';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { DEVICE_IOS } from '@/utils/constants';
import App from './src/App';
import { name as appName } from './app.json';

console.disableYellowBox = true;

// enable react-native-screens
// enableScreens is causing some android devices to crash
if (DEVICE_IOS) {
  enableScreens();
}

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

AppRegistry.registerComponent(appName, () => App);
