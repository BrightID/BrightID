// @flow
import store from '../store';
import { removeOperation } from '../actions';
import fetchUserInfo from '../actions/fetchUserInfo';
import api from '../Api/BrightId';

export const pollOperations = async () => {
  const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes
  try {
    const { operations } = store.getState();
    for (const op of operations) {
      const { state } = await api.getOperationState(op);
      if (state === 'applied' || state === 'failed') {
        store.dispatch(removeOperation(op));
        store.dispatch(fetchUserInfo());
        continue;
      } else if (state !== 'sent') {
        console.log(`${state} is an invalid state!`);
      }
      if (op.timestamp + time_fudge < Date.now()) {
        store.dispatch(removeOperation(op));
      }
    }
  } catch (err) {
    console.warn(err.message);
  }
};
