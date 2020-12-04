// @flow

import React, { useRef, useEffect } from 'react';
import { Animated, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { getGroupName } from '@/utils/groups';
import { DEVICE_TYPE } from '@/utils/deviceConstants';
import GroupsScreen from '@/components/GroupsScreens/GroupsScreen';
import SearchGroups from '@/components/Helpers/SearchGroups';
import SearchConnections from '@/components/Helpers/SearchConnections';
import NewGroupScreen from '@/components/GroupsScreens/NewGroups/NewGroupScreen';
import GroupInfoScreen from '@/components/GroupsScreens/NewGroups/GroupInfoScreen';
import MembersScreen from '@/components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from '@/components/GroupsScreens/Members/InviteListScreen';
import { headerOptions, headerTitleStyle, NavHome } from './helpers';
import { useTranslation } from 'react-i18next';

const Stack = createStackNavigator();

const HeaderTitle = ({ title }) => {
  const searchOpen = useSelector(
    (state) => state.groups.searchOpen || state.connections.searchOpen,
  );
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searchOpen ? 0 : 1,
      useNativeDriver: true,
      duration: 600,
    }).start();
  }, [fadeAnim, searchOpen]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={headerTitleStyle}>{title}</Text>
    </Animated.View>
  );
};

const HeaderTitleI18N = ({ i18key }) => {
  const { t } = useTranslation();
  return (<HeaderTitle title={t(i18key)}/>);
};

const groupsOptions = {
  ...headerOptions,
  headerRight: () => <SearchGroups />,
  headerLeft: () => <NavHome />,
  headerTitle: () => <HeaderTitleI18N i18key="groups.header.groups" />,
};

const newGroupOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => <HeaderTitleI18N i18key="groups.header.newGroup" />,
};

const membersScreenOptions = ({ navigation, route }) => {
  const group = route.params?.group;
  return {
    ...headerOptions,
    title: getGroupName(group),
    headerTitleStyle: {
      fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
      paddingLeft: 20,
      paddingRight: 30,
    },
  };
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
        options={{ ...headerOptions, title: t('groups.header.newGroup') }}
      />
      <Stack.Screen
        name="Members"
        component={MembersScreen}
        options={membersScreenOptions}  
      />
      <Stack.Screen
        name="InviteList"
        component={InviteListScreen}
        options={{ ...headerOptions, title: t('groups.header.inviteList') }}
      />
    </>
  )
};

export default Groups;
