// @flow
import { Alert } from 'react-native';
import api from '@/api/brightId';
import store from '@/store';
import { removeOperation, resetOperations, updateApp } from '@/actions';
import fetchUserInfo from '@/actions/fetchUserInfo';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

const handleOpUpdate = (store, op, state, result) => {
  switch (op.name) {
    case 'Link ContextId':
      store.dispatch(updateApp(op, state, result));
      if (state === 'applied')
        Alert.alert(
          'Success',
          `Succesfully linked ${op.context} with BrightID`,
        );
      break;
    default:
      store.dispatch(fetchUserInfo());
  }
};

export const pollOperations = async () => {
  const {
    operations: { operations },
  } = store.getState();
  try {
    for (const op of operations) {
      const { state, result } = await api.getOperationState(op._key);

      // stop polling for op if trace time is expired
      let removeOp = op.timestamp + time_fudge < Date.now();

      switch (state) {
        case 'unknown':
          // Op not found on server. It might appear in a future poll cycle, so do nothing.
          // console.log(`operation ${op.name} (${op._key}) unknown on server`);
          break;
        case 'init':
        case 'sent':
          // Op still waiting to be processed. Do nothing.
          break;
        case 'applied':
        case 'failed':
          // op is done, so stop polling for it
          removeOp = true;
          handleOpUpdate(store, op, state, result);
          break;
        default:
        // console.log(
        //   `Op ${op.name} (${op._key}) has invalid state '${state}'!`,
        // );
      }
      if (removeOp) {
        store.dispatch(removeOperation(op._key));
      }
    }
  } catch (err) {
    console.warn(err.message);
    store.dispatch(resetOperations());
  }
};
