// @flow

import * as React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Octicons from 'react-native-vector-icons/Octicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_IOS, DEVICE_LARGE } from '@/utils/constants';
import { setGroupSearch } from '../../actions/groups';
/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */

class SearchGroups extends React.Component<Props> {
  componentWillUnmount() {
    // reset search Param
    const { dispatch } = this.props;
    dispatch(setGroupSearch(''));
  }

  render() {
    const { searchParam } = this.props;
    return (
      <View testID="searchView" style={styles.container}>
        <TouchableOpacity style={styles.searchIcon}>
          <Octicons size={20} name="search" color="#333" />
        </TouchableOpacity>
        <TextInput
          testID="searchParam"
          onChangeText={(value) => this.props.dispatch(setGroupSearch(value))}
          style={[
            styles.searchField,
            DEVICE_IOS && { height: DEVICE_LARGE ? 33 : 26 },
          ]}
          placeholder="Search Groups"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="none"
          underlineColorAndroid="transparent"
          placeholderTextColor="#aaa"
          value={searchParam}
        />
        <TouchableOpacity
          testID="clearSearchParamBtn"
          onPress={() => {
            this.props.dispatch(setGroupSearch(''));
          }}
          style={styles.eraserIcon}
        >
          <MaterialCommunityIcons size={22} name="eraser" color="#333" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: DEVICE_LARGE ? 260 : 210,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 0,
    marginTop: 3,
  },
  eraserIcon: {
    marginLeft: 10,
    marginRight: 8.8,
    marginTop: 3,
  },
  searchField: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#333',
    marginLeft: 23,
    flex: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    padding: 0,
    alignItems: 'center',
  },
});

function mapStateToProps(state) {
  const { searchParam } = state.groups;
  return { searchParam };
}

export default connect(mapStateToProps)(SearchGroups);
