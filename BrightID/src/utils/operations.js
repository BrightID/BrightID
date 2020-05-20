// @flow
import { Alert } from 'react-native';
import store from '../store';
import { removeOperation, resetOperations, updateApp } from '../actions';
import fetchUserInfo from '../actions/fetchUserInfo';

import api from '../api/node';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

export const pollOperations = async () => {
  const {
    operations: { operations },
  } = store.getState();
  try {
    for (const op of operations) {
      const { state, result } = await api.getOperationState(op._key);
      if (
        state === 'applied' ||
        state === 'failed' ||
        op.timestamp + time_fudge < Date.now()
      ) {
        if (op.name === 'Link ContextId') {
          store.dispatch(updateApp(op, state, result));
          if (state === 'applied')
            Alert.alert(
              'Success',
              `Succesfully linked ${op.context} with BrightID`,
            );
        } else {
          store.dispatch(fetchUserInfo());
        }
        store.dispatch(removeOperation(op._key));
      } else if (state !== 'sent') {
        console.log(`${state} is an invalid state!`);
      }
    }
  } catch (err) {
    console.warn(err.message);
    store.dispatch(resetOperations());
  }
};
