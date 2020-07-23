// @flow

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { DEVICE_IOS, DEVICE_LARGE } from '@/utils/constants';
import { setGroupSearch, setGroupSearchOpen } from '@/actions';
import searchIcon from '@/static/search_icon.svg';
/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */

const X_TRANSFORM = 250;

const SearchGroups = () => {
  const dispatch = useDispatch();
  const textInput = useRef(null);
  const searchOpen = useSelector((state) => state.groups.searchOpen);
  useEffect(() => {
    // reset search Param
    return () => {
      console.log('clearing search param');
      dispatch(setGroupSearch(''));
      dispatch(setGroupSearchOpen(false));
    };
  }, []);

  const leftAnim = useRef(new Animated.Value(X_TRANSFORM)).current;

  const getPidded = () => {
    if (searchOpen) {
      dispatch(setGroupSearch(''));
      textInput.current.clear();
      textInput.current.blur();
    } else {
      textInput.current.focus();
    }

    dispatch(setGroupSearchOpen(!searchOpen));
    Animated.spring(leftAnim, {
      toValue: searchOpen ? X_TRANSFORM : 0,
      useNativeDriver: true,
    }).start(() => {});
  };

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
          dispatch(setGroupSearch(value));
        }}
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
        clearTextOnFocus={true}
        onFocus={() => {
          dispatch(setGroupSearch(''));
        }}
      />
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
  },
});

export default SearchGroups;
