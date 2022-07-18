import React from 'react';
import { setGroupSearch, setGroupSearchOpen } from '@/actions';
import AnimatedTopSearchBar from './AnimatedTopSearchBar';

/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */
const SearchGroups = () => (
  <AnimatedTopSearchBar
    sortable={false}
    setSearchValue={setGroupSearch}
    setSearchOpen={setGroupSearchOpen}
    searchOpenSelector={(state: RootState) => state.groups.searchOpen}
  />
);

export default SearchGroups;
