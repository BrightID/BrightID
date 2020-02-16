// @flow

import * as React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';
import { createFakeConnection } from './createFakeConnection';
import BottomNav from '../BottomNav';
import { renderListOrSpinner } from './renderConnections';
import FloatingActionButton from '../FloatingActionButton';
import { defaultSort } from './sortingUtility';
import ActionSheet from 'react-native-actionsheet';
import api from '../../Api/BrightId';
import { deleteConnection } from '../../actions';
import { fakeJoinGroups } from '../../actions/fakeGroup';

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

  renderConnection = ({ item }) => <ConnectionCard actionSheet={this.actionSheet} {...item} />;

  deleteConnection = async () => {
    const { dispatch } = this.props;
    const id = this.actionSheet.connection.id;
    try {
      await api.deleteConnection(id);
      // remove connection from redux
      dispatch(deleteConnection(id));
    } catch (err) {
      Alert.alert("Couldn't remove connection", err.message);
    }
  };

  flagAndDeleteConnection = async () => {
    const id = this.actionSheet.connection.id;
    const reason = this.actionSheet.lastAction.split(' as ')[1].toLowerCase();
    const { dispatch } = this.props;
    try {
      await api.flagConnection(id, reason);
      // remove connection from redux
      dispatch(deleteConnection(id));
    } catch (err) {
      Alert.alert("Couldn't remove connection", err.message);
    }
  }

  performAction = (action) => {
    const { id, name } = this.actionSheet.connection;
    action = this.actionSheet.props.options[action];
    this.actionSheet.lastAction = action;
    let title, msg, handler;
    if (action === 'Delete') {
      handler = this.deleteConnection;
      title = 'Delete Connection';
      msg = `Are you sure you want to remove ${name} from your list of connections?`;
    } else if (action.startsWith('Flag')) {
      handler = this.flagAndDeleteConnection;
      title = 'Flag and Delete Connection';
      const reason = action.split(' as ')[1];
      msg = `Are you sure you want to flag ${name} as ${reason} and remove the connection?`;
    } else if (action === 'Join All Groups') {
      const { dispatch, id, secretKey } = this.actionSheet.connection;
      return dispatch(fakeJoinGroups({ id, secretKey }));
    } else {
      return;
    }
    const buttons = [{
      text: 'Cancel',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    }, {
      text: 'OK',
      onPress: handler,
    }];
    Alert.alert(title, msg, buttons, { cancelable: true });

  }

  render() {
    const { navigation } = this.props;
    const actions = ['Delete', 'Flag as Duplicate', 'Flag as Fake', 'Flag as Diseased', 'Join All Groups', 'cancel'];
    if (! __DEV__) {
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
          ref={o => this.actionSheet = o}
          title={'What do you want to do?'}
          options={actions}
          cancelButtonIndex={actions.length - 1}
          onPress={(index) => this.performAction(index)}
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
