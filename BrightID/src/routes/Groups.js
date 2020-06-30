// @flow

import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { getGroupName } from '@/utils/groups';
import { DEVICE_TYPE, DEVICE_IOS } from '@/utils/constants';
import emitter from '@/emitter';
import GroupsScreen from '@/components/GroupsScreens/GroupsScreen';
import SearchGroups from '@/components/GroupsScreens/SearchGroups';
import NewGroupScreen from '@/components/GroupsScreens/NewGroups/NewGroupScreen';
import GroupInfoScreen from '@/components/GroupsScreens/NewGroups/GroupInfoScreen';
import MembersScreen from '@/components/GroupsScreens/Members/MembersScreen';
import InviteListScreen from '@/components/GroupsScreens/Members/InviteListScreen';
import { navigate } from '@/NavigationService';
import backArrow from '@/static/back_arrow.svg';
import { SvgXml } from 'react-native-svg';
import { store } from '@/store';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const topOptions = {
  ...headerOptions,
  headerLeft: () => (
    <TouchableOpacity
      testID="groups-header-back"
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
        // marginTop: DEVICE_LARGE ? 15 : 10,
      }}
      onPress={() => {
        navigate('Home');
      }}
    >
      <SvgXml height="20" xml={backArrow} />
    </TouchableOpacity>
  ),
  headerTitle: () => {
    const { groups } = store.getState().groups;
    return groups.length ? (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <SearchGroups />
      </View>
    ) : null;
  },
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

const Groups = () => (
  <>
    <Stack.Screen name="Groups" component={GroupsScreen} options={topOptions} />
    <Stack.Screen
      name="NewGroup"
      component={NewGroupScreen}
      options={{
        ...headerOptions,
        title: 'New Group',
      }}
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
