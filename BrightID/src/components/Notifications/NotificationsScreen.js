// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { INVITE_ACTIVE } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';

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

    return (
      <View style={styles.container}>
        <FlatList
          data={notificationData}
          keyExtractor={({ inviteId, msg }, index) => (inviteId || msg) + index}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.onRefresh}
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
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default connect((state) => state)(NotificationsScreen);
