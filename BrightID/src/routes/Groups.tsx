import React from 'react';
import { StackNavigationOptions } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { fontSize } from '@/theme/fonts';
import { GroupsScreen } from '@/components/Groups/GroupsScreen';
import SearchGroups from '@/components/Helpers/SearchGroups';
import SearchConnections from '@/components/Helpers/SearchConnections';
import { NewGroupScreen } from '@/components/Groups/NewGroups/NewGroupScreen';
import { GroupInfoScreen } from '@/components/Groups/NewGroups/GroupInfoScreen';
import { MembersScreen } from '@/components/Groups/Members/MembersScreen';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import { headerOptions, NavHome, AnimatedHeaderTitle } from './helpers';
import { Stack } from './Navigator';

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

const membersScreenOptions: StackNavigationOptions = {
  ...headerOptions,
  headerTitleStyle: {
    fontSize: fontSize[20],
    paddingLeft: 20,
    paddingRight: 30,
  },
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
        options={membersScreenOptions}
      />
      <Stack.Screen
        name="InviteList"
        component={ConnectionsScreen}
        options={{
          ...headerOptions,
          headerRight: () => <SearchConnections />,
          headerTitle: () => (
            <AnimatedHeaderTitle text={i18next.t('groups.header.inviteList')} />
          ),
        }}
      />
    </>
  );
};

export default Groups;
