// @flow

import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import reducer from '../reducer';
import { saveStore } from './saveStore';
import { verifyStore } from './verifyStore';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunkMiddleware)),
);

store.subscribe(() => {
  if (verifyStore(store.getState())) {
    setTimeout(() => saveStore(store.getState()));
  } else {
    console.warn('bad state');
  }
});

export default store;
