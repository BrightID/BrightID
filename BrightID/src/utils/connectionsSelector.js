// @flow

import { createSelector } from '@reduxjs/toolkit';
import { toSearchString } from '@/utils/strings';
import { sortConnectionsBy } from '@/utils/sorting';

const searchParamSelector = (state) => state.connections.searchParam;
const connSelector = (state) => state.connections.connections;
const connSortSelector = (state) => state.connections.connectionsSort;
const filtersSelector = (state) => state.connections.filters;

export const connectionsSelector = createSelector(
  [connSelector, searchParamSelector, filtersSelector, connSortSelector],
  (connections, searchParam, filters, connectionsSort) => {
    const searchString = toSearchString(searchParam);
    return connections
      .filter(
        (item) =>
          toSearchString(`${item.name}`).includes(searchString) &&
          filters.includes(item.level),
      )
      .sort(sortConnectionsBy(connectionsSort));
  },
);

export default connectionsSelector;
