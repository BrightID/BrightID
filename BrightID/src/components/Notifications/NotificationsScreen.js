// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { INVITE_ACTIVE } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import NotificationCard from './NotificationCard';
import EmptyList from '../EmptyList';
import InviteCard from './InviteCard';
import EmptyNotifications from './EmptyNotifications';

type State = {
  refreshing: boolean,
};

class NotificationsScreen extends React.Component<Props, State> {
  static navigationOptions = () => ({
    title: 'Notifications',
    headerBackTitleVisible: false,
  });

  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(fetchUserInfo());
    });
  }

  onRefresh = async () => {
    try {
      const { dispatch } = this.props;
      this.setState({ refreshing: true });
      await dispatch(fetchUserInfo());
      this.setState({ refreshing: false });
    } catch (err) {
      console.log(err.message);
      this.setState({ refreshing: false });
    }
  };

  render() {
    const { navigation, notifications, invites } = this.props;
    const activeInvites = invites
      ? invites.filter((invite) => invite.state === INVITE_ACTIVE)
      : [];
    const notificationData = notifications.concat(activeInvites);

    return notificationData.length > 0 ? (
      <View style={styles.container}>
        <FlatList
          style={!notificationData.length && { flex: 1}}
          contentContainerStyle={notificationData.length ? {} : styles.listContainer}
          data={notificationData}
          keyExtractor={({ inviteId, msg }, index) => (inviteId || msg) + index}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
            />
          }
          ListEmptyComponent={
            <EmptyList
              title="Nothing here, come back later.."
              iconSize={46}
              iconType={"bell-off-outline"}
              messageStyle={styles.message}
              />
          }
          renderItem={({ item }) =>
            item.inviteId ? (
              <InviteCard invite={item} />
            ) : (
              <NotificationCard
                navigation={navigation}
                msg={item.msg}
                icon={item.icon}
              />
            )
          }
        />
      </View>
    ) : (
      <EmptyNotifications />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    height: '100%',
    flexGrow: 1
  },
  message: {
   fontFamily: 'ApexNew-Medium',
   textAlign: 'center',
   fontWeight: 'bold',
   fontSize: 18,
   color: '#ccc',
 },
});

export default connect(({ groups, user }) => ({ ...groups, ...user }))(
  NotificationsScreen,
);
