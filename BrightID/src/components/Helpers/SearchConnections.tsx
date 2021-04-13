import React from 'react';
import { setConnectionsSearch, setConnectionsSearchOpen } from '@/actions';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AnimatedSearchBar from './AnimatedSearchBar';

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

  const { t } = useTranslation();

  return (
    <AnimatedSearchBar
      sortable={true}
      handleSort={handleSort}
      setSearchValue={setConnectionsSearch}
      setSearchOpen={setConnectionsSearchOpen}
      searchOpenSelector={(state: State) => state.connections.searchOpen}
      placeholder={t('common.placeholder.searchConnections')}
    />
  );
};

export default SearchConnections;
