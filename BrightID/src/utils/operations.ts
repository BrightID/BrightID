import { Alert } from 'react-native';
import i18next from 'i18next';
import {
  addConnection,
  Operation,
  selectPendingOperations,
  updateMemberships,
  updateOperation,
} from '@/actions';
import { checkTasks } from '@/components/Tasks/TasksSlice';
import { operation_states, OPERATION_TRACE_TIME } from '@/utils/constants';
import { NodeApi } from '@/api/brightId';
import { handleLinkContextOpUpdate } from '@/components/Apps/appThunks';

const handleOpUpdate = (
  dispatch: AppDispatch,
  id: string,
  op: Operation,
  state: OperationStateType,
  result,
  api: NodeApi,
) => {
  let showDefaultError = false;
  switch (op.name) {
    case 'Link ContextId':
      dispatch(handleLinkContextOpUpdate({ op, state, result }));
      break;

    case 'Connect':
      if (op.id1 !== id) {
        // ignore other side of dummy test connections
        break;
      }
      if (state === operation_states.APPLIED) {
        dispatch(addConnection({ id: op.id2, status: 'verified' }));
      } else {
        api.getProfile(op.id2).then((profile) => {
          const conn = {
            id: profile.id,
            // @ts-ignore
            level: profile.level,
            timestamp: profile.connectedAt,
            // @ts-ignore
            reportReason: profile.reports.find((r) => r.id === op.id1)?.reason,
          };
          dispatch(addConnection(conn));
        });
        showDefaultError = true;
      }
      break;

    case 'Add Group':
    case 'Add Membership':
    case 'Remove Membership':
      if (state === operation_states.FAILED) {
        if (op.id && op.id !== id) {
          // the operation was triggered by e2e-tests, using a fake userID. Ignore error.
          showDefaultError = false;
        } else {
          showDefaultError = true;
          api.getMemberships(op.id).then((memberships) => {
            dispatch(updateMemberships(memberships));
          });
        }
      }
      break;

    default:
      if (state === operation_states.FAILED) {
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

export const pollOperations =
  (api: NodeApi): AppThunk<Promise<void>> =>
  async (dispatch: AppDispatch, getState) => {
    const operations = selectPendingOperations(getState());
    const { id } = getState().user;
    const { secretKey } = getState().keypair;
    let shouldUpdateTasks = false;
    try {
      for (const op of operations) {
        let queryApi = api;
        if (op.apiUrl) {
          // If the op has an apiUrl attached, use that instead of the default one.
          // Background: Some operations like "link context" require to query a specific
          // api endpoint as the op is only known on that node
          queryApi = new NodeApi({ url: op.apiUrl, id, secretKey });
        }
        const { state, result } = await queryApi.getOperationState(op.hash);

        if (op.state !== state) {
          switch (state) {
            case operation_states.UNKNOWN:
              // Op not found on server. It might appear in a future poll cycle, so do nothing.
              console.log(
                `operation ${op.name} (${op.hash}) unknown on server`,
              );
              break;
            case operation_states.INIT:
            case operation_states.SENT:
              // Op still waiting to be processed. Do nothing.
              break;
            case operation_states.APPLIED:
            case operation_states.FAILED:
              handleOpUpdate(dispatch, id, op, state, result, api);
              break;
            default:
              console.log(
                `Op ${op.name} (${op.hash}) has invalid state '${state}'!`,
              );
          }
          dispatch(updateOperation({ id: op.hash, changes: { state } }));
          if (state === operation_states.APPLIED) {
            // if an op was applied we should check achievements
            shouldUpdateTasks = true;
          }
        } else {
          // stop polling for op if trace time is expired
          if (
            (op.postTimestamp || op.timestamp) + OPERATION_TRACE_TIME <
            Date.now()
          ) {
            dispatch(
              updateOperation({
                id: op.hash,
                changes: { state: operation_states.EXPIRED },
              }),
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
        dispatch(checkTasks());
      }
    }
  };
