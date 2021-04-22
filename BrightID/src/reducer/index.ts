import apps from './appsSlice';
import channels from '../components/PendingConnections/channelSlice';
import connections from './connectionsSlice';
import groups from './groupsSlice';
import keypair from './keypairSlice';
import notifications from './notifications';
import operations from './operationsSlice';
import pendingConnections from '../components/PendingConnections/pendingConnectionSlice';
import user from './userSlice';
import tasks from '../components/Tasks/TasksSlice';
import socialMedia from '../components/EditProfile/socialMediaSlice';
import recoveryData from '../components/Onboarding/RecoveryFlow/recoveryDataSlice';
import walkthrough from './walkthroughSlice';
import settings from './settingsSlice';

export default {
  apps,
  channels,
  connections,
  groups,
  keypair,
  operations,
  pendingConnections,
  recoveryData,
  notifications,
  user,
  tasks,
  socialMedia,
  walkthrough,
  settings,
};
