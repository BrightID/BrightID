import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import GroupsScreen from '@/components/GroupsScreens/GroupsScreen';
import NewGroupScreen from '@/components/GroupsScreens/NewGroups/NewGroupScreen';
import GroupInfoScreen from '@/components/GroupsScreens/NewGroups/GroupInfoScreen';
import MembersScreen from '@/components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from '@/components/GroupsScreens/Members/InviteListScreen';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const Groups = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="Groups" component={GroupsScreen} />
    <Stack.Screen name="NewGroup" component={NewGroupScreen} />
    <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
    <Stack.Screen name="Members" component={MembersScreen} />
    <Stack.Screen name="InviteList" component={InviteListScreen} />
  </Stack.Navigator>
);

export default Groups;
