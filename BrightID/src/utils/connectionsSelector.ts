import { createSelector } from '@reduxjs/toolkit';
import { toSearchString } from '@/utils/strings';
import { sortConnectionsBy } from '@/utils/sorting';
import { connection_levels } from '@/utils/constants';

const searchParamSelector = (state: State) => state.connections.searchParam;
const connSelector = (state: State) => state.connections.connections;
const connSortSelector = (state: State) => state.connections.connectionsSort;
const filtersSelector = (state: State) => state.connections.filters;

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

export const verifiedConnectionsSelector = createSelector(
  [connSelector],
  (connections) => {
    return connections.filter((item) => item.status === 'verified');
  },
);

export const recoveryConnectionsSelector = createSelector(
  [verifiedConnectionsSelector],
  (connections) => {
    return connections.filter(
      (item) => item.level === connection_levels.RECOVERY,
    );
  },
);

export const connectionByIdSelector = createSelector(
  connSelector,
  (_, connectionId: string) => connectionId,
  (connections, connectionId) => {
    console.log(`connectionByIdSelector ${connectionId}...`);
    return connections.find((connection) => connection.id === connectionId);
  },
);

export default connectionsSelector;