// @flow
import store from '../store';
import { removeOperation } from '../actions';
import fetchUserInfo from '../actions/fetchUserInfo';
import api from '../Api/BrightId';

export const pollOperations = async () => {
  try {
    const { operations } = store.getState();
    for (const op of operations) {
      const { state } = await api.getOperationState(op);
      console.log('state', state);
      if (state === 'applied') {
        store.dispatch(removeOperation(op));
        store.dispatch(fetchUserInfo());
      }
    }
  } catch (err) {
    console.warn(err.message);
  }
};
