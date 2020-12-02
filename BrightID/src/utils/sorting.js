// @flow
import { setConnections, setConnectionsSort } from '@/actions';
import { connection_levels } from './constants';

export const types = {
  byNameAscending: 'BY_NAME_ASCENDING',
  byNameDescending: 'BY_NAME_DESCENDING',
  byDateAddedAscending: 'BY_DATE_ADDED_ASCENDING',
  byDateAddedDescending: 'BY_DATE_ADDED_DESCENDING',
  byTrustLevelAscending: 'BY_TRUST_LEVEL_ASCENDING',
  byTrustLevelDescending: 'BY_TRUST_LEVEL_DESCENDING',
};

const trustLevels = Object.values(connection_levels);

const trustLevel = (level) => trustLevels.indexOf(level);

const handleSort = (connectionsSort, connections) => (dispatch) => {
  switch (connectionsSort) {
    case types.byNameAscending:
      connections.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case types.byNameDescending:
      connections.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case types.byDateAddedAscending:
      connections.sort((a, b) => a.connectionDate - b.connectionDate);
      break;
    case types.byDateAddedDescending:
      connections.sort((a, b) => b.connectionDate - a.connectionDate);
      break;
    case types.byTrustLevelAscending:
      connections.sort((a, b) => {
        return trustLevel(a.level) - trustLevel(b.level);
      });
      break;
    case types.byTrustLevelDescending:
      connections.sort((a, b) => trustLevel(b.level) - trustLevel(a.level));
      break;
    default:
      connections.sort((a, b) => b.connectionDate - a.connectionDate);
      dispatch(setConnectionsSort(types.byDateDescending));
      break;
  }
  dispatch(setConnections(connections));
};

export const defaultSort = () => (dispatch: dispatch, getState: getState) => {
  const {
    connections: { connectionsSort, connections },
  } = getState();
  let list = [...connections];
  dispatch(handleSort(connectionsSort, list));
};
