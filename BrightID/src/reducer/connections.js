// @flow

import { find, propEq, mergeRight } from 'ramda';
import {
  SET_CONNECTIONS,
  CONNECTIONS_SORT,
  UPDATE_CONNECTIONS,
  DELETE_CONNECTION,
  ADD_CONNECTION,
  ADD_TRUSTED_CONNECTION,
  REMOVE_TRUSTED_CONNECTION,
  SET_CONNECTIONS_SEARCH,
  SET_CONNECTIONS_SEARCH_OPEN,
  HYDRATE_CONNECTIONS,
  RESET_STORE,
  FLAG_AND_HIDE_CONNECTION,
  SHOW_CONNECTION,
  STALE_CONNECTION,
} from '@/actions';

export const initialState = {
  connections: [],
  trustedConnections: [],
  connectionsSort: '',
  searchParam: '',
  searchOpen: false,
};

export const reducer = (
  state: ConnectionsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case SET_CONNECTIONS: {
      return {
        ...state,
        connections: action.connections.slice(0),
      };
    }
    case UPDATE_CONNECTIONS: {
      return {
        ...state,
        connections: state.connections.map<connection>((conn: connection) => {
          const updatedConn = find(propEq('id', conn.id))(action.connections);
          if (!updatedConn) {
            if (conn.status === 'verified') conn.status = 'deleted';
            return conn;
          } else {
            if (
              conn.status === 'initiated' ||
              conn.status === 'stale' ||
              !conn.status
            )
              conn.status = 'verified';
            return mergeRight(conn, updatedConn);
          }
        }),
      };
    }
    case ADD_CONNECTION: {
      if (!action.connection.id) return state;
      const removeExisting = ({ id }: connection) =>
        id !== action.connection.id;
      console.log('adding connection', action.connection.id);
      return {
        ...state,
        connections: [
          action.connection,
          ...state.connections.filter(removeExisting),
        ],
      };
    }
    case DELETE_CONNECTION: {
      const connections: connection[] = state.connections.filter(
        (conn: connection) => conn.id !== action.id,
      );
      return {
        ...state,
        connections,
      };
    }
    case FLAG_AND_HIDE_CONNECTION: {
      const connections: connection[] = state.connections.map(
        (conn: connection) => {
          if (conn.id === action.id) {
            conn.status = 'hidden';
            conn.hiddenFlag = action.flag;
          }
          return conn;
        },
      );
      return {
        ...state,
        connections,
      };
    }
    case SHOW_CONNECTION: {
      const connections: connection[] = state.connections.map(
        (conn: connection) => {
          if (conn.id === action.id) {
            conn.status = 'verified';
          }
          return conn;
        },
      );
      return {
        ...state,
        connections,
      };
    }
    case STALE_CONNECTION: {
      const connections: connection[] = state.connections.map(
        (conn: connection) => {
          if (conn.id === action.id) {
            conn.status = 'stale';
          }
          return conn;
        },
      );
      return {
        ...state,
        connections,
      };
    }
    case CONNECTIONS_SORT: {
      return {
        ...state,
        connectionsSort: action.connectionsSort,
      };
    }
    case ADD_TRUSTED_CONNECTION: {
      return {
        ...state,
        trustedConnections: [...state.trustedConnections, action.id],
      };
    }
    case REMOVE_TRUSTED_CONNECTION: {
      const trustedConnections: string[] = state.trustedConnections.filter(
        (id) => id !== action.id,
      );
      return {
        ...state,
        trustedConnections,
      };
    }
    case SET_CONNECTIONS_SEARCH: {
      return {
        ...state,
        searchParam: action.searchParam,
      };
    }
    case SET_CONNECTIONS_SEARCH_OPEN: {
      return {
        ...state,
        searchOpen: action.searchOpen,
      };
    }
    case HYDRATE_CONNECTIONS: {
      if (!action.data.connections || !action.data.trustedConnections)
        return state;

      return { ...action.data };
    }
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
