import { createSelector } from '@reduxjs/toolkit';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { toSearchString } from '@/utils/strings';
import { sortConnectionsBy } from '@/utils/sorting';

const searchParamSelector = (state: RootState) => state.connections.searchParam;
const connSortSelector = (state: RootState) =>
  state.connections.connectionsSort;
const filtersSelector = (state: RootState) => state.connections.filters;

export const connectionsSelector = createSelector(
  [
    selectAllConnections,
    searchParamSelector,
    filtersSelector,
    connSortSelector,
    (_: RootState, excluded: string[] | undefined) => excluded,
  ],
  (connections, searchParam, filters, connectionsSort, excluded) => {
    const searchString = toSearchString(searchParam);
    return connections
      .filter(
        (conn) =>
          conn.name && // Ignore connections that do not have a name
          toSearchString(`${conn.name}`).includes(searchString) &&
          filters.includes(conn.level) &&
          !excluded?.includes(conn.id),
      )
      .sort(sortConnectionsBy(connectionsSort));
  },
);
