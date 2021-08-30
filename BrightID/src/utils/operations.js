import { Alert } from 'react-native';
import store from '@/store';
import {
  removeOperation,
  resetOperations,
  updateLinkedContext,
  selectAllOperations,
  addConnection,
  updateMemberships,
} from '@/actions';
import i18next from 'i18next';
import { checkTasks } from '@/components/Tasks/TasksSlice';

const time_fudge = 2 * 60 * 1000; // trace operations for 2 minutes

const handleOpUpdate = (store, op, state, result, api) => {
  let showDefaultError = false;
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

    case 'Connect':
      if (op.id1 != store.getState().user.id) {
        // ignore other side of dummy test connections
        break;
      }
      if (state === 'applied') {
        store.dispatch(addConnection({ id: op.id2, status: 'verified' }));
      } else {
        api.getProfile(op.id2).then((profile) => {
          const conn = {
            id: profile.id,
            level: profile.level,
            timestamp: profile.connectedAt,
            reportReason: profile.reports.find((r) => r.id === op.id1)?.reason,
          };
          store.dispatch(addConnection(conn));
        });
        showDefaultError = true;
      }
      break;

    case 'Add Group':
    case 'Add Membership':
    case 'Remove Membership':
      if (state === 'failed') {
        if (op.id && op.id !== store.getState().user.id) {
          // the operation was triggered by e2e-tests, using a fake userID. Ignore error.
          showDefaultError = false;
        } else {
          showDefaultError = true;
          api.getMemberships(op.id).then((memberships) => {
            store.dispatch(updateMemberships(memberships));
          });
        }
      }
      break;
    default:
      if (state === 'failed') {
        showDefaultError = true;
      }
  }

  if (showDefaultError) {
    Alert.alert(
      i18next.t('common.alert.error'),
      i18next.t('common.alert.text.failedOp', {
        name: op.name,
        message: result.message,
      }),
    );
  }
};

export const pollOperations = async (api) => {
  const operations = selectAllOperations(store.getState());
  let shouldUpdateTasks = false;
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
          store.dispatch(removeOperation(op.hash));
          handleOpUpdate(store, op, state, result, api);
          shouldUpdateTasks = true;
          break;
        default:
          console.log(
            `Op ${op.name} (${op.hash}) has invalid state '${state}'!`,
          );
      }
    }
    if (shouldUpdateTasks) {
      store.dispatch(checkTasks());
    }
  } catch (err) {
    console.warn(err.message);
    store.dispatch(resetOperations());
  }
};
