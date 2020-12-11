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
import { useTranslation } from 'react-i18next';
import { TabBar, TabView, SceneMap } from 'react-native-tab-view';
import {
  INVITE_ACTIVE,
  CONNECTIONS_TYPE,
  GROUPS_TYPE,
  MISC_TYPE,
} from '@/utils/constants';
import { ORANGE, WHITE, GREY, BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { createSelector } from '@reduxjs/toolkit';
import { selectAllUnconfirmedConnections } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
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
  const { t } = useTranslation();
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
          title={t('notifications.text.noPendingConnections')}
          iconType="account-off-outline"
        />
      }
      renderItem={({ item }) => (
        <PendingConnectionCard pendingConnections={pendingConnections} />
      )}
    />
  );
};

const InviteList = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
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
          title={t('notifications.text.noGroupInvites')}
          iconType="account-group-outline"
        />
      }
      renderItem={({ item }) => (
        <InviteCard navigation={navigation} invite={item} />
      )}
    />
  );
};

const MiscList = ({ route }) => {
  const { t } = useTranslation();
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
          title={t('notifications.text.noMiscellaneous')}
          iconType="bell-off-outline"
        />
      }
      renderItem={({ item }) => (
        <NotificationCard msg={item.msg} icon={item.icon} />
      )}
    />
  );
};

const initialLayout = { width: Dimensions.get('window').width };

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: ORANGE }}
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
    inactiveColor={GREY}
    activeColor={BLACK}
  />
);

export const NotificationsScreen = ({ route }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
      title: t('notifications.tab.connections'),
      badge: !!pendingConnections,
    },
    {
      key: GROUPS_TYPE,
      title: t('notifications.tab.groups'),
      badge: !!invites,
    },
    {
      key: MISC_TYPE,
      title: t('notifications.tab.miscellaneous'),
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
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
  badge: {
    backgroundColor: ORANGE,
    width: DEVICE_LARGE ? 8 : 6,
    height: DEVICE_LARGE ? 8 : 6,
    borderRadius: 4,
    marginRight: DEVICE_LARGE ? 8 : 6,
  },
  tabBar: { backgroundColor: WHITE, paddingLeft: DEVICE_LARGE ? 20 : 18 },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
  },
});

export default NotificationsScreen;
