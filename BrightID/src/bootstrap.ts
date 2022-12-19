import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';
import { scrubOps } from '@/reducer/operationsSlice';
import { rejoinChannels } from '@/components/PendingConnections/channelSlice';

export const bootstrap = async (dispatch: AppDispatch) => {
  // update available usertasks
  dispatch(syncStoreTasks());
  // Initial check for completed tasks
  dispatch(checkTasks());
  // scrub outdated operations from state
  dispatch(scrubOps());
  // restore persisted channels
  dispatch(rejoinChannels());
};
