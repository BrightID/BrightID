// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';

class NotificationsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Notifications',
  });

  render() {
    const { navigation, notifications, invites } = this.props;
    const activeInvites = invites.filter(invite => invite.state === 'active');

    return (
      <View style={styles.container}>
        {activeInvites.length > 0 && (
          <FlatList
            style={styles.groupsContainer}
            data={activeInvites}
            keyExtractor={({ inviteId }, index) => inviteId + index}
            renderItem={({ item }) => (
              <InviteCard invite={item} />
            )}
          />
        )}
        <FlatList
          style={styles.NotificationsList}
          keyExtractor={({ msg }, index) => msg + index}
          data={notifications}
          renderItem={({ item }) => (
            <NotificationCard
              navigation={navigation}
              msg={item.msg}
              icon={item.icon}
            />
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  NotificationsList: {
    flex: 1,
  },
});

export default connect((state) => state)(NotificationsScreen);
