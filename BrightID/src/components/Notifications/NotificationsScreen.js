// @flow

import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  FlatList,
  Text,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabBar, TabView, SceneMap } from 'react-native-tab-view';
import {
  INVITE_ACTIVE,
  ORANGE,
  CONNECTIONS_TYPE,
  GROUPS_TYPE,
  MISC_TYPE,
  DEVICE_LARGE,
} from '@/utils/constants';
import { createSelector } from '@reduxjs/toolkit';
import { selectAllUnconfirmedConnections } from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import fetchUserInfo from '@/actions/fetchUserInfo';
import EmptyList from '@/components/Helpers/EmptyList';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';
import PendingConnectionCard from './PendingConnectionCard';

let thecount = 0;

/** SELECTORS */

const inviteSelector = createSelector(
  (state) => state.groups.invites,
  (invites) => invites.filter(({ state }) => state === INVITE_ACTIVE),
);

/** HOOKS */

const useRefresh = () => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchUserInfo());
      setRefreshing(false);
    } catch (err) {
      console.log(err.message);
      setRefreshing(false);
    }
  };
  return [refreshing, onRefresh];
};

/** COMPONENTS  */

const ConnectionsList = ({ route }) => {
  const [refreshing, onRefresh] = useRefresh();
  const pendingConnections = useSelector((state) =>
    selectAllUnconfirmedConnections(state),
  );
  // only display one notification for all pending connections
  const data = pendingConnections.length > 0 ? [{ id: 'pendingList' }] : [];

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={data}
      keyExtractor={({ id }, index) => id + index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="You have no pending connections.."
          iconType="account-off-outline"
        />
      }
      renderItem={({ item }) => (
        <PendingConnectionCard pendingConnections={pendingConnections} />
      )}
    />
  );
};

const InviteList = ({ route }) => {
  const [refreshing, onRefresh] = useRefresh();
  const invites = useSelector((state) => inviteSelector(state));
  thecount++;
  console.log('Rendering Invite List', thecount);

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={invites}
      keyExtractor={({ inviteId }, index) => inviteId + index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="You have no group invites.."
          iconType="account-group-outline"
        />
      }
      renderItem={({ item }) => <InviteCard invite={item} />}
    />
  );
};

const MiscList = ({ route }) => {
  const navigation = useNavigation();
  const [refreshing, onRefresh] = useRefresh();
  const data = route.backupPending
    ? [{ msg: 'Backup Pending', icon: 'star' }]
    : [];

  console.log('rendering Misc List');
  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
      data={data}
      keyExtractor={({ msg }, index) => msg + index}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <EmptyList
          title="Nothing to see here ..."
          iconType="bell-off-outline"
        />
      }
      renderItem={({ item }) => (
        <NotificationCard
          navigation={navigation}
          msg={item.msg}
          icon={item.icon}
        />
      )}
    />
  );
};

const initialLayout = { width: Dimensions.get('window').width };

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: '#ED7A5D' }}
    style={styles.tabBar}
    renderLabel={({ route, focused, color }) => (
      <View style={styles.tabContainer}>
        {route.badge && <View style={styles.badge} />}
        <Text
          style={[styles.tabText, { color }]}
          adjustsFontSizeToFit={true}
          numberOfLines={1}
        >
          {route.title}
        </Text>
      </View>
    )}
    inactiveColor="#C4C4C4"
    activeColor="#000"
  />
);

export const NotificationsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

  const pendingConnections = useSelector(
    (state) => selectAllUnconfirmedConnections(state)?.length,
  );

  const invites = useSelector((state) => inviteSelector(state)?.length);

  const backupPending = useSelector(
    (state) => state.notifications.backupPending,
  );

  const routes = [
    {
      key: CONNECTIONS_TYPE,
      title: 'connections',
      badge: !!pendingConnections,
    },
    { key: GROUPS_TYPE, title: 'groups', badge: !!invites },
    {
      key: MISC_TYPE,
      title: 'miscellaneous',
      badge: backupPending,
      backupPending,
    },
  ];
  // if we navigate here from the banner, go to the section from the banner
  // if we navigate here normally, go to the first route with content, if any

  const displayRoute = route.params?.type
    ? routes.findIndex(({ key }) => key === route.params?.type)
    : routes.findIndex(({ badge }) => badge);

  const [index, setIndex] = useState(displayRoute);

  const renderScene = SceneMap({
    [CONNECTIONS_TYPE]: ConnectionsList,
    [GROUPS_TYPE]: InviteList,
    [MISC_TYPE]: MiscList,
  });

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUserInfo());
    }, [dispatch]),
  );

  console.log('renderingNotificationScreen');

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 62,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  badge: {
    backgroundColor: '#ED1B24',
    width: DEVICE_LARGE ? 8 : 6,
    height: DEVICE_LARGE ? 8 : 6,
    borderRadius: 4,
    marginRight: DEVICE_LARGE ? 8 : 6,
  },
  tabBar: { backgroundColor: '#fff', paddingLeft: DEVICE_LARGE ? 20 : 18 },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
});

export default NotificationsScreen;
