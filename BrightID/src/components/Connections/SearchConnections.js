// @flow

import * as React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { setSearchParam } from '../../actions';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

type LocalProps = {
  sortable: boolean,
};

class SearchConnections extends React.Component<Props & LocalProps> {
  componentWillUnmount() {
    // reset search Param
    const { dispatch } = this.props;
    dispatch(setSearchParam(''));
  }

  render() {
    const { sortable } = this.props;
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.searchIcon}>
          <Octicons size={26} name="search" color="#333" />
        </TouchableOpacity>
        <TextInput
          onChangeText={(value) => this.props.dispatch(setSearchParam(value))}
          style={styles.searchField}
          placeholder="Search Connections"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          underlineColorAndroid="transparent"
        />
        {sortable && (
          <TouchableOpacity
            onPress={() => {
              const { navigation } = this.props;
              navigation.navigate('SortingConnections');
            }}
            style={styles.optionsIcon}
          >
            <Ionicon size={30} name="ios-options" color="#333" />
          </TouchableOpacity>
        )}
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
    fontSize: 16,
    marginTop: 3.1,
    marginLeft: 23,
    flex: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});

export default connect()(SearchConnections);
