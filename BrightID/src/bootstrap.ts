import { purgeLogs } from '@/utils/logging';
import { scrubOps } from '@/reducer/operationsSlice';
import { rejoinChannels } from '@/components/PendingConnections/actions/channelThunks';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';

export const bootstrap = async (dispatch: AppDispatch) => {
  // purge logfiles
  await purgeLogs();
  // update available usertasks
  dispatch(syncStoreTasks());
  // Initial check for completed tasks
  dispatch(checkTasks());
  // scrub outdated operations from state
  dispatch(scrubOps());
  // restore persisted channels
  dispatch(rejoinChannels());
};
