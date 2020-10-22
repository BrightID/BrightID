// @flow

import {
  APP_VERSION,
  ADD_OPERATION,
  REMOVE_OPERATION,
  RESET_OPERATIONS,
} from '@/actions';
import { version } from '../../package.json';

const initialState = {
  operations: [],
  mobileVersion: version,
};

export const reducer = (
  state: OperationsState = initialState,
  action: action,
) => {
  switch (action.type) {
    case ADD_OPERATION: {
      const operations: operation[] = state.operations.concat(action.op);
      return {
        ...state,
        operations,
      };
    }
    case REMOVE_OPERATION: {
      const operations: operation[] = state.operations.filter(
        (op: operation) => op.hash !== action.opHash,
      );
      return {
        ...state,
        operations,
      };
    }
    case APP_VERSION: {
      let versionCode = state.mobileVersion.split('.');
      // action.version is the codepush label v(n), we need to remove the v
      let incomingPatch = action.version.substring(1);

      versionCode.splice(versionCode.length - 1, 1, incomingPatch);

      return { ...state, mobileVersion: versionCode.join('.') };
    }
    case RESET_OPERATIONS: {
      return { ...state, operations: [] };
    }
    default: {
      return state;
    }
  }
};

// unnecessary for now, but when the app gets larger, combine reducers here

export default reducer;
