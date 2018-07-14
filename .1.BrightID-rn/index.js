import { AppRegistry, YellowBox } from 'react-native';
import App from './src/App';

// quick fix for the annoying warning coming from react-navigations library
YellowBox.ignoreWarnings([
  'Class RCTCxxModule',
  'Warning: isMounted(...) is deprecated',
  'Module RCTImageLoader',
]);

AppRegistry.registerComponent('BrightID', () => App);
