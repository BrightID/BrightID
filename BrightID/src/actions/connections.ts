// export const SET_CONNECTIONS = 'SET_CONNECTIONS';
// export const CONNECTIONS_SORT = 'CONNECTIONS_SORT';
// export const UPDATE_CONNECTIONS = 'UPDATE_CONNECTIONS';
// export const DELETE_CONNECTION = 'DELETE_CONNECTION';
// export const ADD_CONNECTION = 'ADD_CONNECTION';
// export const SET_CONNECTIONS_SEARCH = 'SET_CONNECTIONS_SEARCH';
// export const SET_CONNECTIONS_SEARCH_OPEN = 'SET_CONNECTIONS_SEARCH_OPEN';
// export const SET_CONNECTION_LEVEL = 'SET_CONNECTION_LEVEL';
// export const HYDRATE_CONNECTIONS = 'HYDRATE_CONNECTIONS';
// export const FLAG_AND_HIDE_CONNECTION = 'HIDE_CONNECTION';
// export const SHOW_CONNECTION = 'SHOW_CONNECTION';
// export const STALE_CONNECTION = 'STALE_CONNECTION';
// export const SET_FILTERS = 'SET_FILTERS';

// /**
//  * redux action creator for setting connections array
//  * @param type SET_CONNECTIONS
//  * @param connections array of connections obtained from server and stored locally
//  */
// export const setConnections = (connections: Connection[]) => ({
//   type: SET_CONNECTIONS,
//   connections,
// });

// export const setConnectionsSearch = (searchParam: string) => ({
//   type: SET_CONNECTIONS_SEARCH,
//   searchParam,
// });

// export const setConnectionsSearchOpen = (searchOpen: boolean) => ({
//   type: SET_CONNECTIONS_SEARCH_OPEN,
//   searchOpen,
// });

// export const setConnectionsSort = (connectionsSort: string) => ({
//   type: CONNECTIONS_SORT,
//   connectionsSort,
// });

// /**
//  * redux action creator for removing a connection
//  * @param type UPDATE_CONNECTIONS
//  * @param connections updates connections from server
//  */
// export const updateConnections = (connections: ConnectionInfo[]) => ({
//   type: UPDATE_CONNECTIONS,
//   connections,
// });

// export const deleteConnection = (id: string) => ({
//   type: DELETE_CONNECTION,
//   id,
// });

// /**
//  * redux action creator for setting connections array
//  * @param type ADD_CONNECTION
//  * @param connection add a single connection
//  */
// export const addConnection = (connection: Connection) => ({
//   type: ADD_CONNECTION,
//   connection,
// });

// export const hydrateConnections = (data: ConnectionsState) => ({
//   type: HYDRATE_CONNECTIONS,
//   data,
// });

// export const flagAndHideConnection = (id: string, flag: string) => ({
//   type: FLAG_AND_HIDE_CONNECTION,
//   id,
//   flag,
// });

// export const showConnection = (id: string) => ({
//   type: SHOW_CONNECTION,
//   id,
// });

// export const staleConnection = (id: string) => ({
//   type: STALE_CONNECTION,
//   id,
// });

// export const setConnectionLevel = (id: string, level: ConnectionLevel) => ({
//   type: SET_CONNECTION_LEVEL,
//   id,
//   level,
// });

// export const setFilters = (filters: string[]) => ({
//   type: SET_FILTERS,
//   filters,
// });

export {};
