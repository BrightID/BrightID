// @flow

import AsyncStorage from '@react-native-community/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import reducer from '@/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { migrate } from './migrations';
import {
  groupsTransformer,
  qrDataTransformer,
  userTransformer,
} from './transform';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [userTransformer, groupsTransformer, qrDataTransformer],
  version: 5,
  migrate,
  timeout: 0,
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    // We have a bunch of non-serializable data like secret key etc.
    // TODO For now disabled completely. Revisit later for fine-grained configuration.
    serializableCheck: false,
  }),
});

export const persistor = persistStore(store);

export default store;
