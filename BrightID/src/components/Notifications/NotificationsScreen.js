// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { connect } from 'react-redux';
import NotificationCard from './NotificationCard';

class NotificationsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Notifications',
  });

  render() {
    const { navigation, notifications } = this.props;
    return (
      <View style={styles.container}>
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
    backgroundColor: '#fdfdfd',
  },
  NotificationsList: {
    flex: 1,
  },
});

export default connect((state) => state)(NotificationsScreen);
