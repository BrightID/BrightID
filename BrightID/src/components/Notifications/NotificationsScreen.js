// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import { INVITE_ACTIVE } from '@/utils/constants';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';

class NotificationsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Notifications',
  });

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
