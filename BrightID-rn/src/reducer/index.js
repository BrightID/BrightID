// @flow

import { combineReducers } from 'redux';
import connect from './connect';
import main from './main';

const reducer = combineReducers({
  connect,
  main,
});

export default reducer;
