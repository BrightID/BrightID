import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { useHeaderHeight } from '@react-navigation/stack';
import { ORANGE, WHITE } from '@/theme/colors';

type Props = {
  searchTerm: string;
  filter: number;
  setSearchTerm: (searchTerm: string) => void;
  setFilter: (filter: number) => void;
  fadeBackgroundSearch: Animated.AnimatedInterpolation;
  translateYSearch: Animated.AnimatedInterpolation;
};

const AppsScreenFilter = ({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  fadeBackgroundSearch,
  translateYSearch,
}: Props) => {
  const headerHeight = useHeaderHeight();

  const filters = [
    { name: 'All Apps', id: 1 },
    { name: 'Linked', id: 2 },
    { name: 'Verified', id: 3 },
  ];

  return (
    <>
      <Animated.View
        style={[
          styles.searchBackground,
          { top: headerHeight, opacity: fadeBackgroundSearch },
        ]}
      />
      <Animated.View
        style={[
          styles.searchContainer,
          {
            top: headerHeight + 10,
            transform: [{ translateY: translateYSearch }],
          },
        ]}
      >
        <TextInput
          style={[styles.shadow, styles.textInput]}
          onChangeText={(value) => setSearchTerm(value)}
          placeholder="App name"
          value={searchTerm}
          // onFocus={handleSearchFocus}
        />

        <View style={styles.filterContainer}>
          {filters.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterItemContainer,
                { backgroundColor: index === filter ? ORANGE : WHITE },
              ]}
              onPress={() => setFilter(index)}
            >
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 12,
                  color: index === filter ? WHITE : ORANGE,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    height: 100,
    zIndex: 6,
    // marginTop: 40,
    overflow: 'visible',
  },
  searchBackground: {
    position: 'absolute',
    width: '100%',
    height: 120,
    backgroundColor: `white`,
    zIndex: 5,
  },
  filterContainer: {
    width: '90%',
    flexDirection: 'row',
    marginTop: 10,
  },
  filterItemContainer: {
    borderWidth: 1,
    borderColor: ORANGE,
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  textInput: {
    backgroundColor: 'white',
    width: '90%',
    height: 50,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  shadow: {
    ...Platform.select({
      android: { shadowColor: 'rgba(0,0,0,1)' },
      ios: { shadowColor: 'rgba(0,0,0,0.2)' },
    }),
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default AppsScreenFilter;
