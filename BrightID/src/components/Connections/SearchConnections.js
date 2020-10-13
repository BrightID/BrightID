// @flow

import * as React from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { withTranslation } from 'react-i18next';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { navigate } from '@/NavigationService';
import { setSearchParam } from '@/actions';
import searchIcon from '@/static/search_icon.svg';

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
    const { sortable, t } = this.props;
    return (
      <Animated.View style={styles.container}>
        <TouchableOpacity style={styles.searchIcon}>
          <SvgXml width={20} height={20} xml={searchIcon} />
        </TouchableOpacity>
        <TextInput
          onChangeText={(value) => this.props.dispatch(setSearchParam(value))}
          style={[
            styles.searchField,
            DEVICE_IOS && { height: DEVICE_LARGE ? 33 : 26 },
          ]}
          placeholder={t('common.placeholder.searchConnections')}
          autoCapitalize="words"
          autoCorrect={false}
          textContentType="none"
          underlineColorAndroid="transparent"
          placeholderTextColor="#aaa"
        />
        {sortable && (
          <TouchableOpacity
            onPress={() => {
              navigate('SortingConnections');
            }}
            style={styles.optionsIcon}
          >
            <Ionicon size={22} name="ios-options" color="#333" />
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: DEVICE_LARGE ? 250 : 200,
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
  optionsIcon: {
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
    // justifyContent: 'center',
  },
});

export default connect()(withTranslation()(SearchConnections));
