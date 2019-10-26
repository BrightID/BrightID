// @flow

import * as React from 'react';
import { StyleSheet, View, Alert, FlatList } from 'react-native';
import { connect } from 'react-redux';
import BottomNav from '../BottomNav';
import { getNotifications } from '../../actions/notifications';
import api from '../../Api/BrightId';
import NotificationCard from './NotificationCard';

class NotificationsScreen extends React.Component<Props> {
  static navigationOptions = () => ({
    title: 'Notifications',
  });

  async componentDidMount() {
    const { dispatch } = this.props;
    dispatch(getNotifications());
  }

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.NotificationsList}
          keyExtractor={({ msg }, index) => msg + index}
          data={this.props.notifications}
          renderItem={({ item }) => <NotificationCard navigation={navigation} {...item} />}
        />
        <BottomNav style={{ flex: 0 }} navigation={navigation} />
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

export default connect((state) => state.main)(NotificationsScreen);
