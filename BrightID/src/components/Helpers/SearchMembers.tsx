import React from 'react';
import { setMembersSearch, setMembersSearchOpen } from '@/actions';
import { useTranslation } from 'react-i18next';
import AnimatedSearchBar from './AnimatedSearchBar';

/**
 * Search Bar in the Connections Screen
 * TODO: Add functionality for the Ionicons
 * TODO: add search filter in redux actions
 */
const SearchMembers = () => {
  const { t } = useTranslation();

  return (
    <AnimatedSearchBar
      borderRadius={false}
      sortable={false}
      setSearchValue={setMembersSearch}
      setSearchOpen={setMembersSearchOpen}
      searchOpenSelector={(state: State) => state.groups.membersSearchOpen}
      placeholder={t('common.placeholder.searchMembers')}
    />
  );
};

export default SearchMembers;
