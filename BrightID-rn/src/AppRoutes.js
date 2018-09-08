import * as React from 'react';
import { createStackNavigator, createSwitchNavigator } from 'react-navigation';
import HeaderButtons, {
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import LinearGradient from 'react-native-linear-gradient';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
// import { LinearGradient } from 'expo';
import HomeScreen from './components/HomeScreen';
import ConnectionsScreen from './components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from './components/Connections/SortingConnectionsScreen';
import GroupsScreen from './components/GroupsScreens/GroupsScreen';
import Onboard from './components/OnboardingScreens/Onboard';
import SignUp from './components/OnboardingScreens/SignUp';
import NewConnectionScreen from './components/WebrtcScreens/NewConnectionScreen';
import NewGroupScreen from './components/GroupsScreens/NewGroupScreen';
import PreviewConnectionScreen from './components/WebrtcScreens/PreviewConnectionScreen';
import SuccessScreen from './components/WebrtcScreens/SuccessScreen';
import AppBootstrap from './AppBootstrap';

/**
 * This is BrightID's router, written with React-Navigation
 * Here's the app flow:
 * bootstrap component loads user data from async storage
 * this determines whether to navigate to the onboarding or app stack
 * the onboarding stack contains an intro screen, and a screen for uploading a photo and creating a user name
 * the appstack contains most of the app
 * the mainstack contains the app stack and modals
 *
 */

// header Button
const MaterialHeaderButton = (passMeFurther) => (
  // the `passMeFurther` variable here contains props from <Item .../> as well as <HeaderButtons ... />
  // and it is important to pass those props to `HeaderButton`
  // then you may add some information like icon size or color (if you use icons)
  <HeaderButton
    {...passMeFurther}
    IconComponent={Material}
    iconSize={32}
    color="#fff"
  />
);

const headerTitleStyle = {
  fontFamily: 'EurostileRegular',
  fontWeight: '200',
  fontSize: 24,
  marginLeft: 'auto',
  marginRight: 'auto',
  textAlign: 'center',
  alignSelf: 'center',
  flex: 1,
};

const headerBackground = (
  <LinearGradient
    colors={['#F52828', '#F76B1C']}
    style={{ flex: 1, width: '100%' }}
  />
);

const GroupStack = createStackNavigator(
  {
    GroupMain: {
      screen: GroupsScreen,
    },
    NewGroup: {
      screen: NewGroupScreen,
    },
  },
  {
    initialRouteName: 'GroupMain',
    mode: 'modal',
    headerLayoutPreset: 'center',
    navigationOptions: ({ navigation }) => ({
      title: 'Groups',
      headerTintColor: '#fff',
      headerTitleStyle: {},
      headerBackground,
      headerLeft: (
        <HeaderButtons left={true} HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title="go back"
            iconName={
              navigation.state.routeName === 'NewGroup' ? 'close' : 'arrow-left'
            }
            onPress={() => {
              navigation.goBack(null);
            }}
          />
        </HeaderButtons>
      ),
    }),
  },
);

const ConnectionsStack = createStackNavigator(
  {
    ConnectionsMain: {
      screen: ConnectionsScreen,
    },
    SortingConnections: {
      screen: SortingConnectionsScreen,
    },
  },
  {
    initialRouteName: 'ConnectionsMain',
    mode: 'modal',
    headerLayoutPreset: 'center',
    navigationOptions: ({ navigation }) => ({
      title: 'Groups',
      headerTintColor: '#fff',
      headerTitleStyle,
      headerBackground,
      headerLeft: (
        <HeaderButtons left={true} HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title="go back"
            iconName="arrow-left"
            onPress={() => {
              navigation.goBack(null);
            }}
          />
        </HeaderButtons>
      ),
    }),
  },
);

const NewConnectStack = createStackNavigator(
  {
    NewConnectMain: {
      screen: NewConnectionScreen,
    },
    ConnectSuccess: {
      screen: SuccessScreen,
    },
    PreviewConnection: {
      screen: PreviewConnectionScreen,
    },
  },
  {
    initialRouteName: 'NewConnectMain',
    mode: 'modal',
    headerLayoutPreset: 'center',
    navigationOptions: ({ navigation }) => ({
      title: 'Groups',
      headerTintColor: '#fff',
      headerTitleStyle,
      headerBackground,
      headerLeft: (
        <HeaderButtons left={true} HeaderButtonComponent={MaterialHeaderButton}>
          <Item
            title="go back"
            iconName="arrow-left"
            onPress={() => {
              navigation.goBack(null);
            }}
          />
        </HeaderButtons>
      ),
    }),
  },
);

const AppStack = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
    },
    Connections: {
      screen: ConnectionsStack,
      navigationOptions: {
        header: null,
      },
    },
    Groups: {
      screen: GroupStack,
      navigationOptions: {
        header: null,
      },
    },
    NewConnection: {
      screen: NewConnectStack,
      navigationOptions: {
        header: null,
      },
    },
  },
  {
    initialRouteName: 'Home',
    headerLayoutPreset: 'center',
    navigationOptions: {
      title: 'Groups',
      headerTintColor: '#fff',
      headerTitleStyle,
      headerBackground,
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
      headerTitleStyle,
      headerTransparent: true,
      headerBackground,
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
