// @flow

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { navigate } from '@/NavigationService';
import searchIcon from '@/static/search_icon.svg';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

const X_TRANSFORM = DEVICE_LARGE ? 250 : 195;

const AnimatedTopSearchBar = ({
  sortable,
  setSearchValue,
  setSearchOpen,
  searchOpenSelector,
}) => {
  const dispatch = useDispatch();
  const textInput = useRef(null);
  const searchOpen = useSelector(searchOpenSelector);
  useEffect(() => {
    // reset search Param
    return () => {
      console.log('clearing search param');
      dispatch(setSearchValue(''));
      dispatch(setSearchOpen(false));
    };
  }, []);

  const leftAnim = useRef(new Animated.Value(X_TRANSFORM)).current;

  const getPidded = () => {
    if (searchOpen) {
      dispatch(setSearchValue(''));
      textInput.current.clear();
      textInput.current.blur();
    } else {
      textInput.current.focus();
    }

    dispatch(setSearchOpen(!searchOpen));
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
        <SvgXml
          width={DEVICE_LARGE ? 20 : 18}
          height={DEVICE_LARGE ? 20 : 18}
          xml={searchIcon}
        />
      </TouchableOpacity>
      <TextInput
        ref={textInput}
        onChangeText={(value) => {
          dispatch(setSearchValue(value));
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
          dispatch(setSearchValue(''));
        }}
      />
      {sortable && (
        <TouchableOpacity
          onPress={() => {
            navigate('SortingConnections');
          }}
          style={styles.optionsIcon}
        >
          <Ionicon
            size={DEVICE_LARGE ? 22 : 20}
            name="ios-options"
            color="#333"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: X_TRANSFORM + 50,
    height: DEVICE_LARGE ? 40 : 36,
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
    marginLeft: DEVICE_LARGE ? 23 : 20,
    flex: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    padding: 0,
    alignItems: 'center',
  },
});

export default AnimatedTopSearchBar;
