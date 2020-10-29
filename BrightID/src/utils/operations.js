// @flow
import { Alert } from 'react-native';
import api from '@/api/brightId';
import store from '@/store';
import { removeOperation, resetOperations, addLinkedContext } from '@/actions';
import fetchUserInfo from '@/actions/fetchUserInfo';
import { checkTasks } from '../components/Tasks/TasksSlice';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

const handleOpUpdate = (store, op, state, result) => {
  switch (op.name) {
    case 'Link ContextId':
      store.dispatch(
        addLinkedContext({
          context: op.context,
          contextId: op.contextId,
          dateAdded: op.dateAdded,
          state,
        }),
      );
      if (state === 'applied') {
        Alert.alert(
          'Success',
          `Succesfully linked your account in ${op.context} to your BrightID`,
        );
      } else {
        Alert.alert(
          'Failed',
          `Failed to link your account in ${op.context} to your BrightID\n${result}`,
        );
      }
      break;
    default:
  }
};

export const pollOperations = async () => {
  const {
    operations: { operations },
  } = store.getState();
  let shouldUpdateLocalState = false;
  try {
    for (const op of operations) {
      const { state, result } = await api.getOperationState(op.hash);

      // stop polling for op if trace time is expired
      let removeOp = op.timestamp + time_fudge < Date.now();

      switch (state) {
        case 'unknown':
          // Op not found on server. It might appear in a future poll cycle, so do nothing.
          console.log(`operation ${op.name} (${op.hash}) unknown on server`);
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
          shouldUpdateLocalState = true;
          break;
        default:
          console.log(
            `Op ${op.name} (${op.hash}) has invalid state '${state}'!`,
          );
      }
      if (removeOp) {
        store.dispatch(removeOperation(op.hash));
      }
    }
    if (shouldUpdateLocalState) {
      store.dispatch(fetchUserInfo());
      store.dispatch(checkTasks());
    }
  } catch (err) {
    console.warn(err.message);
    store.dispatch(resetOperations());
  }
};
