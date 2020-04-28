// @flow

import * as React from 'react';
import { StyleSheet, View, Alert, SafeAreaView, FlatList } from 'react-native';
import { connect } from 'react-redux';

import ActionSheet from 'react-native-actionsheet';
import fetchUserInfo from '@/actions/fetchUserInfo';
import FloatingActionButton from '@/components/Helpers/FloatingActionButton';
import EmptyList from '@/components/Helpers/EmptyList';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { createFakeConnection } from './models/createFakeConnection';
import { defaultSort } from './models/sortingUtility';
import { performAction } from './models/modifyConnections';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

export class ConnectionsScreen extends React.Component<Props> {
  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('focus', () => {
      dispatch(defaultSort());
      dispatch(fetchUserInfo());
    });
  }

  handleNewConnection = () => {
    const { navigation } = this.props;
    if (__DEV__) {
      createFakeConnection();
    } else {
      navigation.navigate('Home', { screen: 'NewConnection' });
    }
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    const searchString = searchParam.toLowerCase().replace(/\s/g, '');
    return connections.filter((item) =>
      `${item.name}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchString),
    );
  };

  renderConnection = ({ item }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <ConnectionCard actionSheet={this.actionSheet} {...item} />
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
    if (!__DEV__) {
      // remove 'Join All Groups'
      actions.splice(3, 1);
    }
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            <SearchConnections navigation={navigation} sortable={true} />
            <View style={styles.mainContainer}>
              <FlatList
                style={styles.connectionsContainer}
                data={connections}
                keyExtractor={({ id }, index) => id + index}
                renderItem={this.renderConnection}
                contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fdfdfd',
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
