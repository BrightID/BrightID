import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';
import { scrubOps } from '@/reducer/operationsSlice';
import { rejoinChannels } from '@/components/PendingConnections/channelSlice';

export const bootstrap = async () => {
  // update available usertasks
  store.dispatch(syncStoreTasks());
  // Initial check for completed tasks
  store.dispatch(checkTasks());
  // scrub outdated operations from state
  store.dispatch(scrubOps());
  // restore persisted channels
  store.dispatch(rejoinChannels());
};
