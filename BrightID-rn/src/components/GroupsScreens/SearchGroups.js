// @flow

import * as React from 'react';
import { TouchableOpacity, TextInput, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';

import { setSearchParam } from '../../actions';

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
        <TouchableOpacity style={styles.searchIcon}>
          <Octicons size={26} name="search" color="#000" />
        </TouchableOpacity>
        <TextInput
          value={this.props.searchParam}
          onChangeText={(value) => this.props.dispatch(setSearchParam(value))}
          style={styles.searchField}
          placeholder="Search Groups"
        />
        <TouchableOpacity style={styles.optionsIcon}>
          <Ionicon size={30} name="ios-options" color="#000" />
        </TouchableOpacity>
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
