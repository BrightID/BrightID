// @flow

import * as React from 'react';
import { AsyncStorage, FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Spinner from 'react-native-spinkit';
import SearchConnections from '../SearchConnections';
import ConnectionCard from '../ConnectionCard';
import { setConnections } from '../../actions';

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
    title: 'Connections',
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

  filterConnections = () =>
    this.props.connections.filter((item) =>
      `${item.nameornym}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(this.props.searchParam.toLowerCase().replace(/\s/g, '')),
    );

  renderList = () => {
    if (this.props.connections.length > 0) {
      return (
        <FlatList
          style={styles.connectionsContainer}
          data={this.filterConnections()}
          keyExtractor={({ publicKey }, index) => publicKey.toString() + index}
          renderItem={({ item }) => <ConnectionCard {...item} />}
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
});

export default connect((state) => state.main)(NewGroupScreen);
