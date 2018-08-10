// @flow

import * as React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Touchable from 'react-native-platform-touchable';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { setSearchParam } from '../actions';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

type Props = {
  searchParam: string,
  dispatch: Function,
};

class SearchGroups extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Touchable style={styles.searchIcon}>
          <Ionicon size={28} name="ios-search-outline" color="#000" />
        </Touchable>
        <TextInput
          value={this.props.searchParam}
          onChangeText={(value) => this.props.dispatch(setSearchParam(value))}
          style={styles.searchField}
          placeholder="Search Groups"
        />
        <Touchable style={styles.optionsIcon}>
          <Ionicon size={28} name="ios-options-outline" color="#000" />
        </Touchable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 12,
    marginTop: 5,
  },
  optionsIcon: {
    marginLeft: 10,
    marginRight: 8.8,
    marginTop: 5,
  },
  searchField: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    marginTop: 3.1,
    flex: 1,
  },
});

export default connect(null)(SearchGroups);
