import * as React from 'react';
import {
  createStackNavigator,
  createSwitchNavigator,
  createAppContainer,
} from 'react-navigation';
import {
  HeaderButtons,
  HeaderButton,
  Item,
} from 'react-navigation-header-buttons';
import LinearGradient from 'react-native-linear-gradient';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './components/HomeScreen';
import CheatScreen from './components/CheatScreen';
import ConnectionsScreen from './components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from './components/Connections/SortingConnectionsScreen';
import GroupsScreen from './components/GroupsScreens/GroupsScreen';
import EligibleGroupsScreen from './components/GroupsScreens/EligibleGroupsScreen';
import Onboard from './components/OnboardingScreens/Onboard';
import SignUp from './components/OnboardingScreens/SignUp';
import NewConnectionScreen from './components/NewConnectionsScreens/NewConnectionScreen';
import NewGroupScreen from './components/GroupsScreens/NewGroupScreen';
import CofoundGroupReview from './components/GroupsScreens/CofoundGroupReview';
import CurrentGroupView from './components/GroupsScreens/CurrentGroupView';
import PreviewConnectionScreen from './components/NewConnectionsScreens/PreviewConnectionScreen';
import SuccessScreen from './components/NewConnectionsScreens/SuccessScreen';
import AppBootstrap from './AppBootstrap';
import Apps from './components/Apps/AppsScreen';

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
    CofoundGroupReview: {
      screen: CofoundGroupReview,
    },
    CurrentGroupView: {
      screen: CurrentGroupView,
    },
    SortingConnections: {
      screen: SortingConnectionsScreen,
    },
    EligibleGroups: {
      screen: EligibleGroupsScreen,
    },
  },
  {
    initialRouteName: 'GroupMain',
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
            iconName={
              navigation.state.routeName === 'NewGroup' ? 'close' : 'arrow-left'
            }
            onPress={() => {
              navigation.goBack();
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
              navigation.goBack();
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
              navigation.goBack();
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
    CheatPage: {
      screen: CheatScreen,
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
    Apps: {
      screen: Apps,
      path: 'link-verification/:baseUrl/:context/:id',
    },
  },
  {
    initialRouteName: 'Home',
    // initialRouteName: 'CheatPage',
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
      navigationOptions: {
        header: null,
      },
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
      headerBackground,
    },
  },
);

const AppNavigator = createSwitchNavigator(
  {
    AppBootstrap,
    App: {
      screen: AppStack,
      path: '',
    },
    Onboarding: OnboardingStack,
  },
  {
    initialRouteName: 'AppBootstrap',
  },
);

const prefix = 'brightid://';

const App = createAppContainer(AppNavigator);

const MainApp = () => <App uriPrefix={prefix} />;

export default MainApp;
