import { combineReducers } from 'redux';
import apps from './apps';
import channels from '../components/NewConnectionsScreens/channelSlice';
import connections from './connections';
import connectQrData from './connectQrData';
import connectUserData from './connectUserData';
import groups from './groups';
import operations from './operations';
import pendingConnections from '../components/NewConnectionsScreens/pendingConnectionSlice';
import recoveryData from './recoveryData';
import user from './user';

export default combineReducers({
  apps,
  channels,
  connections,
  connectQrData,
  connectUserData,
  groups,
  operations,
  pendingConnections,
  recoveryData,
  user,
});
