import * as React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch';
import LinearGradient from 'react-native-linear-gradient';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './components/HomeScreen';
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
import Notifications from './components/Notifications/NotificationsScreen';
import TrustedConnectionsScreen from './components/Recovery/TrustedConnectionsScreen';
import BackupScreen from './components/Recovery/BackupScreen';
import RestoreScreen from './components/Recovery/RestoreScreen';
import RecoveringConnectionScreen from './components/Recovery/RecoveringConnectionScreen';
import RecoveryCodeScreen from './components/Recovery/RecoveryCodeScreen';

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

const headerTitleStyle = {
  fontFamily: 'EurostileRegular',
  fontWeight: '200',
  fontSize: 24,
};

const headerBackground = () => (
  <LinearGradient
    colors={['#F52828', '#F76B1C']}
    style={{ flex: 1, width: '100%' }}
  />
);

const defaultNavigationOptions = ({ navigation }) => ({
  headerTintColor: '#fff',
  headerTitleStyle,
  headerBackground,
});

const AppStack = createStackNavigator(
  {
    Home,
    NewConnection: {
      screen: NewConnectionScreen,
    },
    ConnectSuccess: {
      screen: SuccessScreen,
    },
    PreviewConnection: {
      screen: PreviewConnectionScreen,
    },
    Connections: {
      screen: ConnectionsScreen,
    },
    SortingConnections: {
      screen: SortingConnectionsScreen,
    },
    Groups: {
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
    EligibleGroups: {
      screen: EligibleGroupsScreen,
    },
    Notifications,
    Apps: {
      screen: Apps,
      path: 'link-verification/:baseUrl/:context/:id',
    },
    TrustedConnections: {
      screen: TrustedConnectionsScreen,
    },
    Backup: {
      screen: BackupScreen,
    },
    RecoveringConnection: {
      screen: RecoveringConnectionScreen,
    },
  },
  {
    initialRouteName: 'Home',
    defaultNavigationOptions,
  },
);

const OnboardingStack = createStackNavigator(
  {
    Onboard: {
      screen: Onboard,
      navigationOptions: {
        headerShown: false,
      },
    },
    SignUp,
    RecoveryCode: {
      screen: RecoveryCodeScreen,
    },
    Restore: {
      screen: RestoreScreen,
    },
  },
  {
    initialRouteName: 'Onboard',
    defaultNavigationOptions,
  },
);

const AppNavigator = createAnimatedSwitchNavigator(
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

// const GroupStack = createStackNavigator(
//   {
//     GroupMain: {
//       screen: GroupsScreen,
//     },
//     NewGroup: {
//       screen: NewGroupScreen,
//       navigationOptions: ({ navigation }) => ({
//         // headerLeft: () => (
//         //   <HeaderButtons
//         //     left={true}
//         //     HeaderButtonComponent={MaterialHeaderButton}
//         //   >
//         //     <Item
//         //       title="close"
//         //       iconName="close"
//         //       onPress={() => {
//         //         navigation.goBack();
//         //       }}
//         //     />
//         //   </HeaderButtons>
//         // ),
//       }),
//     },
//     CofoundGroupReview: {
//       screen: CofoundGroupReview,
//     },
//     CurrentGroupView: {
//       screen: CurrentGroupView,
//     },
//     SortingConnections: {
//       screen: SortingConnectionsScreen,
//     },
//     EligibleGroups: {
//       screen: EligibleGroupsScreen,
//     },
//   },
//   {
//     initialRouteName: 'GroupMain',
//     mode: 'modal',
//     defaultNavigationOptions,
//   },
// );

// const ConnectionsStack = createStackNavigator(
//   {
//     ConnectionsMain: {
//       screen: ConnectionsScreen,
//     },
//     SortingConnections: {
//       screen: SortingConnectionsScreen,
//     },
//   },
//   {
//     initialRouteName: 'ConnectionsMain',
//     mode: 'modal',
//     defaultNavigationOptions,
//   },
// );

// const NewConnectStack = createStackNavigator(
//   {
//     NewConnectMain: {
//       screen: NewConnectionScreen,
//     },
//     ConnectSuccess: {
//       screen: SuccessScreen,
//     },
//     PreviewConnection: {
//       screen: PreviewConnectionScreen,
//       navigationOptions: ({ navigation }) => ({
//         // headerLeft: () => (
//         //   <HeaderButtons
//         //     left={true}
//         //     HeaderButtonComponent={MaterialHeaderButton}
//         //   >
//         //     <Item
//         //       title="close"
//         //       iconName="close"
//         //       onPress={() => {
//         //         navigation.navigate('Home');
//         //       }}
//         //     />
//         //   </HeaderButtons>
//         // ),
//       }),
//     },
//   },
//   {
//     initialRouteName: 'NewConnectMain',
//     mode: 'modal',
//     defaultNavigationOptions,
//   },
// );
