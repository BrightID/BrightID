// @flow

import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGroupName } from '@/utils/groups';
import { DEVICE_TYPE } from '@/utils/constants';
import emitter from '@/emitter';
import GroupsScreen from '@/components/GroupsScreens/GroupsScreen';
import SearchGroups from '@/components/Helpers/SearchGroups';
import SearchConnections from '@/components/Helpers/SearchConnections';
import NewGroupScreen from '@/components/GroupsScreens/NewGroups/NewGroupScreen';
import GroupInfoScreen from '@/components/GroupsScreens/NewGroups/GroupInfoScreen';
import MembersScreen from '@/components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from '@/components/GroupsScreens/Members/InviteListScreen';
import { headerOptions, headerTitleStyle, NavHome } from './helpers';

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

const groupsOptions = {
  ...headerOptions,
  headerRight: () => <SearchGroups />,
  headerLeft: () => <NavHome />,
  headerTitle: () => <HeaderTitle title="Groups" />,
};

const newGroupOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections />,
  headerTitle: () => <HeaderTitle title="New Group" />,
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
    headerRight: () => (
      <TouchableOpacity
        testID="groupOptionsBtn"
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
      options={{ ...headerOptions, title: 'New Groups' }}
    />
    <Stack.Screen
      name="Members"
      component={MembersScreen}
      options={membersScreenOptions}
    />
    <Stack.Screen
      name="InviteList"
      component={InviteListScreen}
      options={{ ...headerOptions, title: 'Invite List' }}
    />
  </>
);

export default Groups;
