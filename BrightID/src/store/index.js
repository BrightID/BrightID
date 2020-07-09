// @flow

import AsyncStorage from '@react-native-community/async-storage';
import thunkMiddleware from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import reducer from '@/reducer';
import { migrate } from './migrations';
import {
  groupsTransformer,
  qrDataTransformer,
  userTransformer,
  connectionsTransformer,
} from './transform';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [
    userTransformer,
    groupsTransformer,
    qrDataTransformer,
    connectionsTransformer,
  ],
  version: 6,
  migrate,
  timeout: null,
};

const persistedReducer = persistReducer(persistConfig, reducer);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunkMiddleware)),
);

export const persistor = persistStore(store);

export default store;
