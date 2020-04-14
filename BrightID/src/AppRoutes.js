// @flow

import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import { connect } from 'react-redux';
import HomeScreen from './components/HomeScreen';
import ConnectionsScreen from './components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from './components/Connections/SortingConnectionsScreen';
import Onboard from './components/OnboardingScreens/Onboard';
import SignUp from './components/OnboardingScreens/SignUp';
import NewConnectionScreen from './components/NewConnectionsScreens/NewConnectionScreen';

import GroupsScreen from './components/GroupsScreens/GroupsScreen';
import GroupInfoScreen from './components/GroupsScreens/NewGroups/GroupInfoScreen';
import NewGroupScreen from './components/GroupsScreens/NewGroups/NewGroupScreen';
import MembersScreen from './components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from './components/GroupsScreens/Members/InviteListScreen';

import PreviewConnectionScreen from './components/NewConnectionsScreens/PreviewConnectionScreen';
import SuccessScreen from './components/NewConnectionsScreens/SuccessScreen';
// import AppBootstrap from './AppBootstrap';
import AppsScreen from './components/Apps/AppsScreen';
import NotificationsScreen from './components/Notifications/NotificationsScreen';
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
  headerTitleAlign: 'center',
  // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
});

// const AppStack = createStackNavigator(
//   {
//     Home,
//     NewConnection: {
//       screen: NewConnectionScreen,
//     },
//     ConnectSuccess: {
//       screen: SuccessScreen,
//     },
//     PreviewConnection: {
//       screen: PreviewConnectionScreen,
//     },
//     Connections: {
//       screen: ConnectionsScreen,
//     },
//     SortingConnections: {
//       screen: SortingConnectionsScreen,
//     },
//     Groups: {
//       screen: GroupsScreen,
//     },
//     NewGroup: {
//       screen: NewGroupScreen,
//     },
//     GroupInfo: {
//       screen: GroupInfoScreen,
//     },
//     Members: {
//       screen: MembersScreen,
//     },
//     InviteList: {
//       screen: InviteListScreen,
//     },
//     Notifications,
//     Apps: {
//       screen: Apps,
//       path: 'link-verification/:baseUrl/:context/:contextId',
//     },
//     TrustedConnections: {
//       screen: TrustedConnectionsScreen,
//     },
//     Backup: {
//       screen: BackupScreen,
//     },
//     RecoveringConnection: {
//       screen: RecoveringConnectionScreen,
//     },
//   },
//   {
//     initialRouteName: 'Home',
//     defaultNavigationOptions,
//   },
// );

// const OnboardingStack = createStackNavigator(
//   {
//     Onboard: {
//       screen: Onboard,
//       navigationOptions: {
//         headerShown: false,
//       },
//     },
//     SignUp,
//     RecoveryCode: {
//       screen: RecoveryCodeScreen,
//     },
//     Restore: {
//       screen: RestoreScreen,
//     },
//   },
//   {
//     initialRouteName: 'Onboard',
//     defaultNavigationOptions,
//   },
// );

// const AppNavigator = createAnimatedSwitchNavigator(
//   {
//     AppBootstrap,
//     App: {
//       screen: AppStack,
//       path: '',
//     },
//     Onboarding: OnboardingStack,
//   },
//   {
//     initialRouteName: 'AppBootstrap',
//   },
// );

const HomeStack = createStackNavigator();

const Home = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Home" component={HomeScreen} />
    <HomeStack.Screen name="NewConnection" component={NewConnectionScreen} />
    <HomeStack.Screen name="ConnectSuccess" component={SuccessScreen} />
    <HomeStack.Screen
      name="PreviewConnection"
      component={PreviewConnectionScreen}
    />
    <HomeStack.Screen
      name="RecoveringConnection"
      component={RecoveringConnectionScreen}
    />
  </HomeStack.Navigator>
);

const ConnectionsStack = createStackNavigator();

const Connections = () => (
  <ConnectionsStack.Navigator>
    <ConnectionsStack.Screen name="Connections" component={ConnectionsScreen} />
    <ConnectionsStack.Screen
      name="SortingConnections"
      component={SortingConnectionsScreen}
    />
  </ConnectionsStack.Navigator>
);

const GroupsStack = createStackNavigator();

const Groups = () => (
  <GroupsStack.Navigator>
    <GroupsStack.Screen name="Groups" component={GroupsScreen} />
    <GroupsStack.Screen name="NewGroup" component={NewGroupScreen} />
    <GroupsStack.Screen name="GroupInfo" component={GroupInfoScreen} />
    <GroupsStack.Screen name="Members" component={MembersScreen} />
    <GroupsStack.Screen name="InviteList" component={InviteListScreen} />
  </GroupsStack.Navigator>
);

const NotificationStack = createStackNavigator();

const Notifications = () => (
  <NotificationStack.Navigator>
    <NotificationStack.Screen
      name="Notifications"
      component={NotificationsScreen}
    />
    <NotificationStack.Screen
      name="TrustedConnections"
      component={TrustedConnectionsScreen}
    />
    <NotificationStack.Screen name="Backup" component={BackupScreen} />
  </NotificationStack.Navigator>
);

const RestoreStack = createStackNavigator();

const Restore = () => (
  <RestoreStack.Navigator>
    <RestoreStack.Screen name="RecoveryCode" component={RecoveryCodeScreen} />
    <RestoreStack.Screen name="Restore" component={RestoreScreen} />
  </RestoreStack.Navigator>
);

const Tab = createBottomTabNavigator();

const MainApp = ({ publicKey }: { publicKey?: string }) => (
  <Tab.Navigator>
    {publicKey ? (
      <>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Connections" component={Connections} />
        <Tab.Screen name="Groups" component={Groups} />
        <Tab.Screen name="Notifications" component={Notifications} />
        <Tab.Screen name="Apps" component={AppsScreen} />
      </>
    ) : (
      <>
        <Tab.Screen name="Onboard" component={Onboard} />
        <Tab.Screen name="SignUp" component={SignUp} />
        <Tab.Screen name="Restore" component={Restore} />
      </>
    )}
  </Tab.Navigator>
);

// const prefix = 'brightid://';

// const App = createAppContainer(AppNavigator);

// const MainApp = () => <App ref={setTopLevelNavigator} uriPrefix={prefix} />;

export default connect(({ user: { publicKey } }) => ({ publicKey }))(MainApp);
