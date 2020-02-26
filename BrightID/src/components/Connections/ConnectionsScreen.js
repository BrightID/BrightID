// @flow

import * as React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ActionSheet from 'react-native-actionsheet';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { createFakeConnection } from './models/createFakeConnection';
import { renderListOrSpinner } from './renderConnections';
import FloatingActionButton from '../FloatingActionButton';
import { defaultSort } from './models/sortingUtility';
import { performAction } from './models/modifyConnections';
import fetchUserInfo from '../../actions/fetchUserInfo';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type State = {
  loading: boolean,
};

export class ConnectionsScreen extends React.Component<Props, State> {
  static navigationOptions = ({ navigation }: { navigation: navigation }) => ({
    title: 'Connections',
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 11 }}
        onPress={createFakeConnection(navigation)}
      >
        <Material name="dots-horizontal" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  });

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(defaultSort());
      dispatch(fetchUserInfo());
    });
  }

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
    const actions = [
      'Flag as Duplicate',
      'Flag as Fake',
      'Flag as Diseased',
      'Join All Groups',
      'cancel',
    ];
    if (!__DEV__) {
      // remove 'Join All Groups'
      actions.splice(4, 1);
    }
    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.mainContainer}>
            <SearchConnections navigation={navigation} sortable={true} />
            <View style={styles.mainContainer}>
              {renderListOrSpinner(this)}
            </View>
          </View>
          <FloatingActionButton
            onPress={() => navigation.navigate('NewConnection')}
          />
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
      </View>
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

export default connect((state) => state)(ConnectionsScreen);
