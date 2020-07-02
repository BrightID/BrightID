// @flow

import * as React from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import { INVITE_ACTIVE, ORANGE } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import EmptyList from '@/components/Helpers/EmptyList';
import NotificationCard from './NotificationCard';
import InviteCard from './InviteCard';

type State = {
  refreshing: boolean,
};

class NotificationsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('focus', () => {
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
    const { navigation, notifications } = this.props;

    return (
      <>
        <View style={styles.orangeTop} />
        <View style={styles.container}>
          <FlatList
            contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
            data={notifications}
            keyExtractor={({ inviteId, msg }, index) =>
              (inviteId || msg) + index
            }
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
            ListEmptyComponent={
              <EmptyList
                title="Nothing here, come back later.."
                iconType="bell-off-outline"
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
      </>
    );
  }
}

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
    paddingTop: 5,
  },
});

export default connect(({ groups, notifications }) => ({
  ...groups,
  ...notifications,
}))(NotificationsScreen);
