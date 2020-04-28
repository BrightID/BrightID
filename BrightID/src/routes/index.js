// @flow

import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { connect } from 'react-redux';
import Apps from './Apps';
import Connections from './Connections';
import Groups from './Groups';
import Home from './Home';
import Notifications from './Notifications';
import Onboarding from './Onboarding';
import { icon } from './helpers';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Home"
      component={Home}
      options={{ tabBarIcon: icon('home', 'home-outline') }}
    />
    <Tab.Screen
      name="Connections"
      component={Connections}
      options={{
        tabBarIcon: icon('account-heart', 'account-heart-outline'),
      }}
    />
    <Tab.Screen
      name="Groups"
      component={Groups}
      options={{
        tabBarIcon: icon('account-group', 'account-group-outline'),
      }}
    />
    <Tab.Screen
      name="Notifications"
      component={Notifications}
      options={{ tabBarIcon: icon('bell', 'bell-outline') }}
    />
    <Tab.Screen
      name="Apps"
      component={Apps}
      options={{ tabBarIcon: icon('flask', 'flask-outline') }}
    />
  </Tab.Navigator>
);

const MainApp = ({ publicKey }: { publicKey?: string }) => (
  <Stack.Navigator>
    {publicKey ? (
      <Stack.Screen
        name="App"
        component={MainTabs}
        options={{ headerShown: false }}
      />
    ) : (
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{ headerShown: false }}
      />
    )}
  </Stack.Navigator>
);

export default connect(({ user: { publicKey } }) => ({ publicKey }))(MainApp);

// const prefix = 'brightid://';

// const App = createAppContainer(AppNavigator);

// const MainApp = () => <App ref={setTopLevelNavigator} uriPrefix={prefix} />;

// const headerTitleStyle = {
//   fontFamily: 'EurostileRegular',
//   fontWeight: '200',
//   fontSize: 24,
// };

// const headerBackground = () => (
//   <LinearGradient
//     colors={['#F52828', '#F76B1C']}
//     style={{ flex: 1, width: '100%' }}
//   />
// );

// const defaultNavigationOptions = ({ navigation }) => ({
//   headerTintColor: '#fff',
//   headerTitleStyle,
//   headerBackground,
//   headerTitleAlign: 'center',
//   // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
// });
