import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { setConnectionsSearch, setConnectionsSearchOpen } from '@/actions';
import AnimatedTopSearchBar from './AnimatedTopSearchBar';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */
const SearchConnections = () => {
  const navigation = useNavigation();

  const handleSort = () => {
    navigation.navigate('SortConnections');
  };

  return (
    <AnimatedTopSearchBar
      sortable={true}
      handleSort={handleSort}
      setSearchValue={setConnectionsSearch}
      setSearchOpen={setConnectionsSearchOpen}
      searchOpenSelector={(state: RootState) => state.connections.searchOpen}
    />
  );
};

export default SearchConnections;
