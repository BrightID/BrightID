import { combineReducers } from 'redux';
import apps from './apps';
import channels from '../components/PendingConnectionsScreens/channelSlice';
import connections from './connections';
import groups from './groups';
import notifications from './notifications';
import operations from './operations';
import pendingConnections from '../components/PendingConnectionsScreens/pendingConnectionSlice';
import recoveryData from './recoveryData';
import user from './user';

export default combineReducers({
  apps,
  channels,
  connections,
  groups,
  operations,
  pendingConnections,
  recoveryData,
  notifications,
  user,
});
