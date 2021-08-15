import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { useDispatch, useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import Search from '@/components/Icons/Search';
import { GREY, LIGHT_BLACK, WHITE, ORANGE } from '@/theme/colors';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */
const X_TRANSFORM = DEVICE_LARGE ? 250 : 195;

const AnimatedTopSearchBar = ({
  sortable,
  handleSort = () => null,
  setSearchValue,
  setSearchOpen,
  searchOpenSelector,
}) => {
  const dispatch = useDispatch();
  const textInput = useRef<TextInput>(null);
  const searchOpen = useSelector(searchOpenSelector);
  const { t } = useTranslation();

  useEffect(() => {
    // reset search Param
    return () => {
      console.log('clearing search param');
      dispatch(setSearchValue(''));
      dispatch(setSearchOpen(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const leftAnim = useRef(new Animated.Value(X_TRANSFORM)).current;

  const getPidded = () => {
    if (searchOpen) {
      dispatch(setSearchValue(''));
      textInput.current?.clear();
      textInput.current?.blur();
    } else {
      textInput.current?.focus();
    }

    dispatch(setSearchOpen(!searchOpen));
    Animated.spring(leftAnim, {
      toValue: searchOpen ? X_TRANSFORM : 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchIcon}
        onPress={getPidded}
        testID="SearchBarBtn"
      >
        <Search
          width={DEVICE_LARGE ? 20 : 18}
          height={DEVICE_LARGE ? 20 : 18}
        />
      </TouchableOpacity>
      <TextInput
        testID="SearchParam"
        ref={textInput}
        onChangeText={(value) => {
          dispatch(setSearchValue(value));
        }}
        style={[
          styles.searchField,
          DEVICE_IOS && { height: DEVICE_LARGE ? 33 : 26 },
        ]}
        placeholder={t('common.placeholder.searchConnections')}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="none"
        underlineColorAndroid="transparent"
        placeholderTextColor={GREY}
        clearTextOnFocus={true}
        onFocus={() => {
          dispatch(setSearchValue(''));
        }}
      />
      {sortable && (
        <TouchableOpacity onPress={handleSort} style={styles.optionsIcon}>
          <Ionicon
            size={DEVICE_LARGE ? 22 : 20}
            name="ios-options"
            color={LIGHT_BLACK}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '90%',
    height: DEVICE_LARGE ? 40 : 36,
    marginTop: '5%',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
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
    fontSize: fontSize[15],
    color: LIGHT_BLACK,
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
