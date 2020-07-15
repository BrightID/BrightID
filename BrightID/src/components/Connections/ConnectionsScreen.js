// @flow

import * as React from 'react';
import {
  StyleSheet,
  View,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import { connect } from 'react-redux';
import ActionSheet from 'react-native-actionsheet';
import fetchUserInfo from '@/actions/fetchUserInfo';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import { deleteConnection } from '@/actions';
import { ORANGE } from '@/utils/constants';
import ConnectionCard from './ConnectionCard';
import { defaultSort } from './models/sortingUtility';
import { performAction } from './models/modifyConnections';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type State = {
  refreshing: boolean,
};

export class ConnectionsScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('focus', () => {
      dispatch(defaultSort());
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

  handleNewConnection = () => {
    const { navigation } = this.props;
    navigation.navigate('MyCode');
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    const searchString = searchParam.toLowerCase().replace(/\s/g, '');
    return connections.filter((item) =>
      `${item.name}`.toLowerCase().replace(/\s/g, '').includes(searchString),
    );
  };

  handleRemoveConnection = (connection) => {
    if (connection.status === 'verified') {
      console.log(
        `Cant remove verified connection ${connection.id} (${connection.name}).`,
      );
      return;
    }

    const buttons = [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          console.log(
            `Removing connection ${connection.id} (${connection.name})`,
          );
          const { dispatch } = this.props;
          dispatch(deleteConnection(connection.id));
        },
      },
    ];
    Alert.alert(
      `Remove connection`,
      `Are you sure you want to remove connection with ${connection.name}? You can reconnect anytime.`,
      buttons,
      {
        cancelable: true,
      },
    );
  };

  renderConnection = ({ item }) => (
    <ConnectionCard
      actionSheet={this.actionSheet}
      onRemove={this.handleRemoveConnection}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...item}
    />
  );

  modifyConnection = (option: string) => {
    if (!this.actionSheet || !this.actionSheet.connection) return;

    const action = this.actionSheet.props.options[option];

    if (action === 'cancel') return;

    const { title, msg, handler } = performAction(
      action,
      this.actionSheet.connection,
    );

    const { dispatch } = this.props;

    const buttons = [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          handler().then(() => {
            dispatch(defaultSort());
          });
        },
      },
    ];

    Alert.alert(title, msg, buttons, { cancelable: true });
  };

  render() {
    const { navigation } = this.props;
    const connections = this.filterConnections();
    const actions = [
      'Flag as Duplicate',
      'Flag as Fake',
      'Flag as Deceased',
      'Join All Groups',
      'cancel',
    ];
    // comment out for test release
    if (!__DEV__) {
      // remove 'Join All Groups'
      actions.splice(3, 1);
    }
    return (
      <>
        <View style={styles.orangeTop} />

        <View style={styles.container} testID="connectionsScreen">
          <View style={styles.mainContainer}>
            <View style={styles.mainContainer}>
              <FlatList
                style={styles.connectionsContainer}
                data={connections}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderConnection}
                contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
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
                    iconType="account-off-outline"
                    title="No connections"
                  />
                }
              />
            </View>
          </View>
          <FloatingActionButton onPress={this.handleNewConnection} />
        </View>
        <ActionSheet
          ref={(o) => {
            this.actionSheet = o;
          }}
          title="What do you want to do?"
          options={actions}
          cancelButtonIndex={actions.length - 1}
          onPress={(index) => this.modifyConnection(index)}
        />
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
    overflow: 'hidden',
    zIndex: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 8,
  },
  connectionsContainer: {
    flex: 1,
  },
  moreIcon: {
    marginRight: 16,
  },
  emptyText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
  },
});

export default connect(({ connections, user }) => ({
  ...connections,
  ...user,
}))(ConnectionsScreen);
