// @flow

import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';

/**
 * Connection screen of BrightID
 */

type Props = {
  connections: Array<{
    nameornym: string,
    id: number,
  }>,
  searchParam: string,
};

class ConnectionsScreen extends React.Component<Props> {
  static navigationOptions = {
    title: 'Connections',
    headerRight: <View />,
  };

  keyExtractor = (item) => item.publicKey;

  filterConnections = () =>
    this.props.connections.filter((item) =>
      `${item.nameornym}`
        .toLowerCase()
        .replace(/\s/g, '')
        .includes(this.props.searchParam.toLowerCase().replace(/\s/g, '')),
    );

  render() {
    return (
      <View style={styles.container}>
        <SearchConnections />
        <FlatList
          style={styles.connectionsContainer}
          data={this.filterConnections()}
          keyExtractor={this.keyExtractor}
          renderItem={({ item }) => <ConnectionCard {...item} />}
        />
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
    marginTop: 8,
    flex: 1,
  },
});

export default connect((state) => state.main)(ConnectionsScreen);
