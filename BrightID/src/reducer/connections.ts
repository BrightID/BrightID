import { mergeRight } from 'ramda';
import { keyBy } from 'lodash';
import {
  SET_CONNECTIONS,
  CONNECTIONS_SORT,
  UPDATE_CONNECTIONS,
  DELETE_CONNECTION,
  ADD_CONNECTION,
  SET_CONNECTIONS_SEARCH,
  SET_CONNECTIONS_SEARCH_OPEN,
  HYDRATE_CONNECTIONS,
  RESET_STORE,
  FLAG_AND_HIDE_CONNECTION,
  SHOW_CONNECTION,
  STALE_CONNECTION,
  SET_CONNECTION_LEVEL,
  SET_FILTERS,
} from '@/actions';
import { connection_levels } from '@/utils/constants';

export const initialState = {
  connections: [],
  connectionsSort: '',
  searchParam: '',
  searchOpen: false,
  filters: [
    connection_levels.SUSPICIOUS,
    connection_levels.JUST_MET,
    connection_levels.ALREADY_KNOWN,
    connection_levels.RECOVERY,
  ],
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
      const connectionsMap = keyBy(action.connections, 'id');
      return {
        ...state,
        connections: state.connections.map<connection>((conn: connection) => {
          const updatedConn = connectionsMap[conn.id];
          if (!updatedConn) {
            if (conn.status === 'verified') conn.status = 'deleted';
            return conn;
          } else {
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
    case SET_CONNECTION_LEVEL: {
      const connections: connection[] = state.connections.map(
        (conn: connection) => {
          if (conn.id === action.id) {
            conn.level = action.level;
          }
          return conn;
        },
      );
      return {
        ...state,
        connections,
      };
    }
    case SET_FILTERS: {
      return {
        ...state,
        filters: action.filters,
      };
    }
    case HYDRATE_CONNECTIONS: {
      if (!action.data.connections) return state;

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