import * as React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { setSearchParam } from '@/actions';
import { fontSize } from '@/theme/fonts';
import { LIGHT_BLACK, LIGHT_GREY, GREY, WHITE } from '@/theme/colors';
import { useDispatch } from '@/store';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

type SearchConnectionsProps = {
  sortable: boolean;
};

export const SearchConnections = ({ sortable }: SearchConnectionsProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchIcon}>
        <Octicons size={26} name="search" color={LIGHT_BLACK} />
      </TouchableOpacity>
      <TextInput
        onChangeText={(value) => dispatch(setSearchParam(value))}
        style={styles.searchField}
        placeholder={t('common.placeholder.searchConnections')}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="name"
        underlineColorAndroid="transparent"
        placeholderTextColor={GREY}
      />
      {sortable && (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SortingConnections');
          }}
          style={styles.optionsIcon}
        >
          <Ionicon size={30} name="ios-options" color={LIGHT_BLACK} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    width: '80%',
    borderColor: LIGHT_GREY,
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
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
    marginLeft: 23,
    flex: 1,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
});
