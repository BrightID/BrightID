// @flow

export const SET_CONNECTIONS = 'SET_CONNECTIONS';
export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
export const DELETE_CONNECTION = 'DELETE_CONNECTION';
export const ADD_CONNECTION = 'ADD_CONNECTION';
export const ADD_TRUSTED_CONNECTION = 'ADD_TRUSTED_CONNECTION';
export const REMOVE_TRUSTED_CONNECTION = 'REMOVE_TRUSTED_CONNECTION';
export const HYDRATE_CONNECTIONS = 'HYDRATE_CONNECTIONS';

/**
 * redux action creator for setting connections array
 * @param type SET_CONNECTIONS
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnections = (connections: connection[]) => ({
  type: SET_CONNECTIONS,
  connections,
});

/**
 * redux action creator for setting connections array
 * @param type CONNECTIONS_SORT
 * @param connections array of connections obtained from server and stored locally
 */

export const setConnectionsSort = (connectionsSort: string) => ({
  type: CONNECTIONS_SORT,
  connectionsSort,
});

/**
 * redux action creator for removing a connection
 * @param type UPDATE_CONNECTIONS
 * @param connections updates connections from server
 */

export const updateConnections = (connections: connection[]) => ({
  type: UPDATE_CONNECTIONS,
  connections,
});

/**
 * redux action creator for removing a connection
 * @param type DELETE_CONNECTION
 * @param connection removes a connection object from the array of connections and removes id from connection ids
 */

export const deleteConnection = (id: string) => ({
  type: DELETE_CONNECTION,
  id,
});

/**
 * redux action creator for setting connections array
 * @param type ADD_CONNECTION
 * @param connection add a single connection
 */

export const addConnection = (connection: connection) => ({
  type: ADD_CONNECTION,
  connection,
});

export const addTrustedConnection = (id: string) => ({
  type: ADD_TRUSTED_CONNECTION,
  id,
});

export const removeTrustedConnection = (id: string) => ({
  type: REMOVE_TRUSTED_CONNECTION,
  id,
});

export const hydrateConnections = (data: ConnectionsState) => ({
  type: HYDRATE_CONNECTIONS,
  data,
});
