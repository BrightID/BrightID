// @flow

import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import Reactotron from 'reactotron-react-native';
import reducer from '../reducer';

console.warn(__DEV__);

const store = Reactotron.createStore(
  reducer,
  compose(applyMiddleware(thunkMiddleware)),
);

const unsubscribe = store.subscribe(() => console.log(store.getState()));

export default store;

// TODO Set up async storage middleware to save the redux of the application
