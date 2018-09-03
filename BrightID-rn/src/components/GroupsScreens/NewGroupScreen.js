// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Ionicon from 'react-native-vector-icons/Ionicons';
import SearchConnections from '../Connections/SearchConnections';
import ConnectionCard from '../Connections/ConnectionCard';
import { removeConnection, setConnections } from '../../actions';

/**
 * Connection screen of BrightID
 * Displays a search input and list of Connection Cards
 */

type Props = {
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  searchParam: string,
};

class NewGroupScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'New Group',
    headerRight: <View />,
  };

  componentDidMount() {
    this.getConnections();
  }

  getConnections = async () => {
    try {
      const { dispatch } = this.props;
      /**
       * obtain connection keys from async storage
       * currently everything in async storage except for `userData` is a connection
       *
       * THIS MIGHT CHANGE WHEN GROUPS ARE ADDED
       */

      const allKeys = await AsyncStorage.getAllKeys();
      const connectionKeys = allKeys.filter((val) => val !== 'userData');
      const storageValues = await AsyncStorage.multiGet(connectionKeys);
      const connections = storageValues.map((val) => JSON.parse(val[1]));
      // update redux store
      dispatch(setConnections(connections));
    } catch (err) {
      console.log(err);
    }
  };

  handleUserOptions = (publicKey) => () => {
    const { nameornym } = this.props;
    Alert.alert(
      'Delete connection',
      `Are you sure you want to remove ${nameornym} from your list of connections? Your decision is irreversable.`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: this.removeUser(publicKey) },
      ],
      { cancelable: true },
    );
  };

  removeUser = (publicKey) => async () => {
    try {
      const { dispatch } = this.props;
      // update redux store
      dispatch(removeConnection(publicKey));
      // remove connection from async storage
      await AsyncStorage.removeItem(publicKey.toString());
    } catch (err) {
      console.log(err);
    }
  };

  filterConnections = () => {
    const { connections, searchParam } = this.props;
    return connections.filter((item) =>
      `${item.nameornym}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(searchParam.toLowerCase().replace(/\s/g, '')),
    );
  };

  renderActionComponent = (publicKey) => (
    <TouchableOpacity
      style={styles.moreIcon}
      onPress={this.handleUserOptions(publicKey)}
    >
      <Ionicon size={48} name="ios-more" color="#ccc" />
    </TouchableOpacity>
  );

  renderConnection = ({ item }) => (
    <ConnectionCard
      {...item}
      renderActionComponent={this.renderActionComponent}
    />
  );

  renderList = () => {
    const { connections } = this.props;
    if (connections.length > 0) {
      return (
        <FlatList
          style={styles.connectionsContainer}
          data={this.filterConnections()}
          keyExtractor={({ publicKey }, index) => publicKey.toString() + index}
          renderItem={this.renderConnection}
        />
      );
    } else {
      return (
        <Spinner
          style={styles.spinner}
          isVisible={true}
          size={47}
          type="WanderingCubes"
          color="#4990e2"
        />
      );
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.cofounderMessage}>
          <Text>CO-FOUNDERS</Text>
          <Text>To create a group, you must select two co-founders</Text>
        </View>
        <SearchConnections />
        <View style={styles.mainContainer}>{this.renderList()}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  connectionsContainer: {
    flex: 1,
  },
  mainContainer: {
    marginTop: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect((state) => state.main)(NewGroupScreen);
