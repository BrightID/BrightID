// @flow
import store from '../store';
import { removeOperation, resetOperations } from '../actions';
import fetchUserInfo from '../actions/fetchUserInfo';
import api from '../Api/BrightId';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

export const pollOperations = async () => {
  const {
    operations: { list: operations },
  } = store.getState();
  try {
    for (const op of operations) {
      const { state } = await api.getOperationState(op);
      if (
        state === 'applied' ||
        state === 'failed' ||
        op.timestamp + time_fudge < Date.now()
      ) {
        store.dispatch(removeOperation(op));
        store.dispatch(fetchUserInfo());
      } else if (state !== 'sent') {
        console.log(`${state} is an invalid state!`);
      }
    }
  } catch (err) {
    console.warn(err.message);
    store.dispatch(resetOperations());
  }
};
