import React from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import GroupsScreen from '@/components/Groups/GroupsScreen';
import SearchGroups from '@/components/Helpers/SearchGroups';
import SearchConnections from '@/components/Helpers/SearchConnections';
import NewGroupScreen from '@/components/Groups/GroupCreation/CreateGroupScreen';
import GroupInfoScreen from '@/components/Groups/GroupCreation/NewGroupInfoScreen';
import MembersScreen from '@/components/Groups/IndividualGroup/GroupScreen';
import InviteListScreen from '@/components/Groups/IndividualGroup/InviteListScreen';
import i18next from 'i18next';
import { headerOptions, NavHome, AnimatedHeaderTitle } from './helpers';

const Stack = createStackNavigator();

const groupsOptions: StackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchGroups />,
  headerLeft: () => <NavHome />,
  headerTitle: () => (
    <AnimatedHeaderTitle text={i18next.t('groups.header.groups', 'Groups')} />
  ),
};

const newGroupOptions: StackNavigationOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => (
    <AnimatedHeaderTitle
      text={i18next.t('groups.header.newGroup', 'New Group')}
    />
  ),
};

const Groups = () => {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen
        name="Groups"
        component={GroupsScreen}
        options={groupsOptions}
      />
      <Stack.Screen
        name="NewGroup"
        component={NewGroupScreen}
        options={newGroupOptions}
      />
      <Stack.Screen
        name="GroupInfo"
        component={GroupInfoScreen}
        options={{
          ...headerOptions,
          title: t('groups.header.newGroup', 'New Group'),
        }}
      />
      <Stack.Screen
        name="Members"
        component={MembersScreen}
        options={{ ...headerOptions, title: '' }}
      />
      <Stack.Screen
        name="InviteList"
        component={InviteListScreen}
        options={{
          ...headerOptions,
          headerRight: () => <SearchConnections />,
          headerTitle: () => (
            <AnimatedHeaderTitle text={t('groups.header.inviteList')} />
          ),
        }}
      />
    </>
  );
};

export default Groups;
