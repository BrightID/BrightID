// @flow

import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import SearchConnections from './SearchConnections';
import ConnectionCard from './ConnectionCard';

/**
 * Connection screen of BrightID
 */

class ConnectionsScreen extends React.Component {
  static propTypes = {
    allConnections: PropTypes.array,
    searchParam: PropTypes.string,
  };
  static navigationOptions = {
    title: 'Connections',
  };
  _keyExtractor = item => item.firstName + item.lastName + item.id;

  filterConnections = () =>
    this.props.allConnections.filter(item =>
      `${item.firstName} ${item.lastName}`
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
          keyExtractor={this._keyExtractor}
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

export default connect(state => state.main)(ConnectionsScreen);
