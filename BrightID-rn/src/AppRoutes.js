import * as React from 'react';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
// import { LinearGradient } from 'expo';
import HomeScreen from './components/HomeScreen';
import ConnectionsScreen from './components/ConnectionsScreen';
import GroupsScreen from './components/GroupsScreen';
import Onboard from './components/Onboard';
import SignUp from './components/SignUp';
import QRCodeScannerScreen from './components/QRCodeScannerScreen';
import NewConnectionScreen from './components/NewConnectionScreen';
import DisplayQRCodeScreen from './components/DisplayQRCodeScreen';
import AppBootstrap from './AppBootstrap';

const AppStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Connections: {
      screen: ConnectionsScreen,
    },
    Groups: {
      screen: GroupsScreen,
    },
    QRCodeScanner: {
      screen: QRCodeScannerScreen,
    },
    NewConnection: {
      screen: NewConnectionScreen,
    },
    DisplayQRCode: {
      screen: DisplayQRCodeScreen,
    },
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      title: 'BrightID',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontFamily: 'EurostileRegular',
        fontWeight: '200',
        fontSize: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        alignSelf: 'center',
        flex: 1,
      },
      headerBackground: (
        <LinearGradient
          colors={['#F52828', '#F76B1C']}
          style={{ flex: 1, width: '100%' }}
        />
      ),
    },
  },
);

const OnboardingStack = createStackNavigator(
  {
    Onboard: {
      screen: Onboard,
    },
    SignUp: {
      screen: SignUp,
    },
  },
  {
    initialRouteName: 'Onboard',
    navigationOptions: {
      title: 'BrightID',
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontFamily: 'EurostileRegular',
        fontWeight: '200',
        fontSize: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
        alignSelf: 'center',
        flex: 1,
      },
      headerTransparent: true,
      headerBackground: (
        <LinearGradient
          colors={['#F52828', '#F76B1C']}
          style={{ flex: 1, width: '100%' }}
        />
      ),
    },
  },
);

export default createSwitchNavigator(
  {
    AppBootstrap,
    App: AppStack,
    Onboarding: OnboardingStack,
  },
  {
    initialRouteName: 'AppBootstrap',
  },
);
