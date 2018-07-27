// @flow

import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import Reactotron from 'reactotron-react-native';
import reducer from '../reducer';

let store;

if (global.__DEV__ && !global.__TESTING__) {
  store = Reactotron.createStore(
    reducer,
    compose(applyMiddleware(thunkMiddleware)),
  );
} else {
  store = createStore(reducer, compose(applyMiddleware(thunkMiddleware)));
}

// store.subscribe(() => console.log(store.getState()));

export default store;

// TODO Set up async storage middleware to save the redux of the application
