/** @format */
import './ReactotronConfig';
import { AppRegistry, YellowBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

YellowBox.ignoreWarnings(['Module RNOS requires main queue setup']);
YellowBox.ignoreWarnings(['Module WebRTCModule requires main queue setup']);

AppRegistry.registerComponent(appName, () => App);
