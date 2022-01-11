import { Alert } from 'react-native';
import i18next from 'i18next';
import store from '@/store';
import {
  updateLinkedContext,
  addConnection,
  updateMemberships,
  updateOperation,
  selectPendingOperations,
} from '@/actions';
import { checkTasks } from '@/components/Tasks/TasksSlice';

const trace_duration = 2 * 60 * 1000; // trace operations for 2 minutes

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
      if (op.id1 !== store.getState().user.id) {
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
  const operations: Array<Operation> = selectPendingOperations(
    store.getState(),
  );
  let shouldUpdateTasks = false;
  try {
    for (const op of operations) {
      // If the op has an api instance attached, use that instead of the default one.
      // Background: Some operations like "link context" require to query a specific
      // api endpoint as the op is only known on that node
      const queryApi = op.api || api;
      const { state, result } = await queryApi.getOperationState(op.hash);

      if (op.state !== state) {
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
            handleOpUpdate(store, op, state, result, api);
            break;
          default:
            console.log(
              `Op ${op.name} (${op.hash}) has invalid state '${state}'!`,
            );
        }
        store.dispatch(updateOperation({ id: op.hash, changes: { state } }));
        if (state === 'applied') {
          // if an op was applied we should check achievements
          shouldUpdateTasks = true;
        }
      } else {
        // stop polling for op if trace time is expired
        if (op.timestamp + trace_duration < Date.now()) {
          store.dispatch(
            updateOperation({ id: op.hash, changes: { state: 'expired' } }),
          );
        }
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      console.warn(err.message);
    } else {
      console.warn(err);
    }
  } finally {
    if (shouldUpdateTasks) {
      store.dispatch(checkTasks());
    }
  }
};
