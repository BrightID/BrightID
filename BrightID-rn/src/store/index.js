// @flow

import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import reducer from '../reducer';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(thunkMiddleware)),
);

// store.subscribe(() => console.log(store.getState()));

export default store;

// TODO Set up async storage middleware to save the redux of the application
