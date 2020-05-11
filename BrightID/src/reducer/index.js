import { combineReducers } from 'redux';
import apps from './apps';
import connections from './connections';
import connectQrData from './connectQrData';
import connectUserData from './connectUserData';
import groups from './groups';
import notifications from './notifications';
import operations from './operations';
import recoveryData from './recoveryData';
import user from './user';

export default combineReducers({
  apps,
  connections,
  connectQrData,
  connectUserData,
  groups,
  operations,
  recoveryData,
  notifications,
  user,
});
