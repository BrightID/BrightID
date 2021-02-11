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

export const sortConnectionsBy = (connectionsSort) => {
  switch (connectionsSort) {
    case types.byNameAscending:
      return (a, b) => b.name.localeCompare(a.name);

    case types.byNameDescending:
      return (a, b) => a.name.localeCompare(b.name);

    case types.byDateAddedAscending:
      return (a, b) => a.connectionDate - b.connectionDate;

    case types.byDateAddedDescending:
      return (a, b) => b.connectionDate - a.connectionDate;

    case types.byTrustLevelAscending:
      return (a, b) => trustLevel(a.level) - trustLevel(b.level);

    case types.byTrustLevelDescending:
      return (a, b) => trustLevel(b.level) - trustLevel(a.level);

    default:
      return (a, b) => b.connectionDate - a.connectionDate;
  }
};