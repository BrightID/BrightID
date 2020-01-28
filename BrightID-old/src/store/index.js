// @flow

import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import reducer from '../reducer';
// eslint-disable-next-line import/no-cycle
import { saveStore } from './saveStore';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunkMiddleware)),
);

store.subscribe(() => {
  setTimeout(() => saveStore());
});

export default store;
