// @flow
import { setConnections, setConnectionsSort } from '../../actions';

export const types = {
  byNameAscending: 'BY_NAME_ASCENDING',
  byNameDescending: 'BY_NAME_DESCENDING',
  byTrustScoreAscending: 'BY_TRUST_SCORE_ASCENDING',
  byTrustScoreDescending: 'BY_TRUST_SCORE_DECENDING',
  byDateAddedAscending: 'BY_DATE_ADDED_ASCENDING',
  byDateAddedDescending: 'BY_DATE_ADDED_DESCENDING',
};

export const sortByNameAscending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => a.nameornym.localeCompare(b.nameornym));
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byNameAscending));
};

export const sortByNameDescending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => b.nameornym.localeCompare(a.nameornym));
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byNameDescending));
};

export const sortByTrustScoreAscending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => parseFloat(a.trustScore) - parseFloat(b.trustScore));
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byTrustScoreAscending));
};

export const sortByTrustScoreDescending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => parseFloat(b.trustScore) - parseFloat(a.trustScore));
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byTrustScoreDescending));
};

export const sortByDateAddedAscending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => a.connectionDate - b.connectionDate);
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byDateAddedAscending));
};

export const sortByDateAddedDescending = () => (dispatch, getState) => {
  const { connections } = getState().main;
  let list = connections.slice();
  list.sort((a, b) => b.connectionDate - a.connectionDate);
  dispatch(setConnections(list));
  dispatch(setConnectionsSort(types.byDateAddedDescending));
};
