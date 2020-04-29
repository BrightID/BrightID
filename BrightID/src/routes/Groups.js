// @flow

import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGroupName } from '@/utils/groups';
import { DEVICE_TYPE } from '@/utils/constants';
import emitter from '@/emitter';
import GroupsScreen from '@/components/GroupsScreens/GroupsScreen';
import NewGroupScreen from '@/components/GroupsScreens/NewGroups/NewGroupScreen';
import GroupInfoScreen from '@/components/GroupsScreens/NewGroups/GroupInfoScreen';
import MembersScreen from '@/components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from '@/components/GroupsScreens/Members/InviteListScreen';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const membersScreenOptions = ({ navigation, route }) => {
  const group = route.params?.group;
  return {
    title: getGroupName(group),
    headerTitleStyle: {
      fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
      paddingLeft: 20,
      paddingRight: 30,
    },
    // eslint-disable-next-line react/display-name
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 11 }}
        onPress={() => {
          emitter.emit('optionsSelected');
        }}
      >
        <Material name="dots-horizontal" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  };
};

const Groups = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="Groups" component={GroupsScreen} />
    <Stack.Screen
      name="NewGroup"
      component={NewGroupScreen}
      options={{ title: 'New Group', headerShown: DEVICE_TYPE === 'large' }}
    />
    <Stack.Screen
      name="GroupInfo"
      component={GroupInfoScreen}
      options={{ title: 'New Groups' }}
    />
    <Stack.Screen
      name="Members"
      component={MembersScreen}
      options={membersScreenOptions}
    />
    <Stack.Screen
      name="InviteList"
      component={InviteListScreen}
      options={{ title: 'Invite List' }}
    />
  </Stack.Navigator>
);

export default Groups;
