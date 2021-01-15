// @flow

import apps from './apps';
import channels from '../components/PendingConnectionsScreens/channelSlice';
import connections from './connections';
import groups from './groups';
import keypair from './keypair';
import notifications from './notifications';
import operations from './operations';
import pendingConnections from '../components/PendingConnectionsScreens/pendingConnectionSlice';
import user from './userSlice';
import tasks from '../components/Tasks/TasksSlice';
import socialMedia from '../components/EditProfile/socialMediaSlice';
import recoveryData from '../components/Recovery/recoveryDataSlice';

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
};
