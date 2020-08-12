// @flow

import React from 'react';
import { setConnectionsSearch, setConnectionsSearchOpen } from '@/actions';
import AnimatedTopSearchBar from './AnimatedTopSearchBar';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */

const SearchConnections = () => (
  <AnimatedTopSearchBar
    sortable={true}
    setSearchValue={setConnectionsSearch}
    setSearchOpen={setConnectionsSearchOpen}
    searchOpenSelector={(state) => state.connections.searchOpen}
  />
);

export default SearchConnections;
