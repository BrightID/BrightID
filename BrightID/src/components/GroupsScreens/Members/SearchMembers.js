// @flow

import * as React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { fontSize } from '@/theme/fonts';
import { setSearchParam } from '@/actions';
import { GREY, WHITE, LIGHT_BLACK } from '@/theme/colors';

class SearchMembers extends React.Component<Props> {
  componentWillUnmount() {
    this.props.dispatch(setSearchParam(''));
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.searchIcon}>
          <Octicons size={26} name="search" color="#333" />
        </TouchableOpacity>
        <TextInput
          onChangeText={(value) => this.props.dispatch(setSearchParam(value))}
          style={styles.searchField}
          placeholder="Search Members"
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="name"
          underlineColorAndroid="transparent"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          onPress={() => {
            const { navigation } = this.props;
            navigation.navigate('SortingConnections');
          }}
          style={styles.optionsIcon}
        >
          <Ionicon size={30} name="ios-options" color="#333" />
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
    borderColor: GREY,
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
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
    fontSize: fontSize[14],
    color: LIGHT_BLACK,
    flex: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});

export default connect()(SearchMembers);
