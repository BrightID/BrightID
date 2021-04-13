import React from 'react';
import { setGroupsSearch, setGroupsSearchOpen } from '@/actions';
import { useTranslation } from 'react-i18next';
import AnimatedSearchBar from './AnimatedSearchBar';

/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */
const SearchGroups = () => {
  const { t } = useTranslation();

  return (
    <AnimatedSearchBar
      sortable={false}
      setSearchValue={setGroupsSearch}
      setSearchOpen={setGroupsSearchOpen}
      searchOpenSelector={(state: State) => state.groups.groupsSearchOpen}
      placeholder={t('common.placeholder.searchGroups')}
    />
  );
};

export default SearchGroups;
