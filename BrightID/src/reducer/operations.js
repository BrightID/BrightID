// @flow

import {
  APP_VERSION,
  ADD_OPERATION,
  REMOVE_OPERATION,
  RESET_OPERATIONS,
} from '@/actions';
import { version, latestCodePushLabel } from '../../package.json';

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
      // appVersion returned by code-push is more accurate than package.json
      // codepush labels increment indefinitely, but we only want to update the patch for the latest version
      // so we subtract the latest codepush label to obtain accurate patch version
      let incomingPatch =
        parseInt(action.label.substring(1), 10) -
        parseInt(latestCodePushLabel, 10);

      if (incomingPatch < 0) incomingPatch = 0;

      let appVersion = action.appVersion.split('.');
      appVersion.splice(appVersion.length - 1, 1, incomingPatch);

      return { ...state, mobileVersion: appVersion.join('.') };
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
