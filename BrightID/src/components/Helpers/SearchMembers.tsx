import React from 'react';
import { setConnectionsSearch, setConnectionsSearchOpen } from '@/actions';
import { useNavigation } from '@react-navigation/native';
import AnimatedMidSearchBar from './AnimatedMidSearchBar';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */
const SearchMembers = () => {
  const navigation = useNavigation();

  const handleSort = () => {
    navigation.navigate('SortConnections');
  };

  return (
    <AnimatedMidSearchBar
      sortable={true}
      handleSort={handleSort}
      setSearchValue={setConnectionsSearch}
      setSearchOpen={setConnectionsSearchOpen}
      searchOpenSelector={(state: State) => state.connections.searchOpen}
    />
  );
};

export default SearchMembers;
