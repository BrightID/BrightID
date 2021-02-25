import { Alert } from 'react-native';
import api from '@/api/brightId';
import store from '@/store';
import {
  removeOperation,
  resetOperations,
  updateLinkedContext,
} from '@/actions';
import fetchUserInfo from '@/actions/fetchUserInfo';
import i18next from 'i18next';
import { checkTasks } from '../components/Tasks/TasksSlice';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

const handleOpUpdate = (store, op, state, result) => {
  switch (op.name) {
    case 'Link ContextId':
      store.dispatch(
        updateLinkedContext({
          context: op.context,
          contextId: op.contextId,
          state,
        }),
      );

      if (state === 'applied') {
        Alert.alert(
          i18next.t('apps.alert.title.linkSuccess'),
          i18next.t('apps.alert.text.linkSuccess', {
            context: `${op.context}`,
          }),
        );
      } else {
        Alert.alert(
          i18next.t('apps.alert.title.linkFailure'),
          i18next.t('apps.alert.text.linkFailure', {
            context: `${op.context}`,
            result: `${result.message}`,
          }),
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
