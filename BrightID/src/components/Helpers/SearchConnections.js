// @flow

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { navigate } from '@/NavigationService';
import { setConnectionsSearchParam, setConnectionsSearchOpen } from '@/actions';
import searchIcon from '@/static/search_icon.svg';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

const X_TRANSFORM = 250;

const SearchConnections = ({ sortable }) => {
  const dispatch = useDispatch();
  const textInput = useRef(null);
  const searchOpen = useSelector((state) => state.connections.searchOpen);
  useEffect(() => {
    // reset search Param
    return () => {
      console.log('clearing search param');
      dispatch(setConnectionsSearchParam(''));
      dispatch(setConnectionsSearchOpen(false));
    };
  }, []);

  const leftAnim = useRef(new Animated.Value(X_TRANSFORM)).current;

  const getPidded = () => {
    if (searchOpen) {
      dispatch(setConnectionsSearchParam(''));
      textInput.current.clear();
      textInput.current.blur();
    } else {
      textInput.current.focus();
    }

    dispatch(setConnectionsSearchOpen(!searchOpen));
    Animated.spring(leftAnim, {
      toValue: searchOpen ? X_TRANSFORM : 0,
      useNativeDriver: true,
    }).start(() => {});
  };

  console.log('rendering', leftAnim);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            {
              translateX: leftAnim,
            },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.searchIcon} onPress={getPidded}>
        <SvgXml width={20} height={20} xml={searchIcon} />
      </TouchableOpacity>
      <TextInput
        ref={textInput}
        onChangeText={(value) => {
          dispatch(setConnectionsSearchParam(value));
        }}
        style={[
          styles.searchField,
          DEVICE_IOS && { height: DEVICE_LARGE ? 33 : 26 },
        ]}
        placeholder="Search Connections"
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="none"
        underlineColorAndroid="transparent"
        placeholderTextColor="#aaa"
        clearTextOnFocus={true}
        onFocus={() => {
          dispatch(setConnectionsSearchParam(''));
        }}
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
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: 300,
    height: 40,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginLeft: 15,
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

export default SearchConnections;
