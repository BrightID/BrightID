import { createSelector } from '@reduxjs/toolkit';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { toSearchString } from '@/utils/strings';
import { sortConnectionsBy } from '@/utils/sorting';

const searchParamSelector = (state: State) => state.connections.searchParam;
const connSortSelector = (state: State) => state.connections.connectionsSort;
const filtersSelector = (state: State) => state.connections.filters;

export const connectionsSelector = createSelector(
  [
    selectAllConnections,
    searchParamSelector,
    filtersSelector,
    connSortSelector,
    (_: State, excluded: string[] | undefined) => excluded,
  ],
  (connections, searchParam, filters, connectionsSort, excluded) => {
    const searchString = toSearchString(searchParam);
    return connections
      .filter(
        (conn) =>
          toSearchString(`${conn?.name}`).includes(searchString) &&
          filters.includes(conn?.level) &&
          !excluded?.includes(conn.id),
      )
      .sort(sortConnectionsBy(connectionsSort));
  },
);
