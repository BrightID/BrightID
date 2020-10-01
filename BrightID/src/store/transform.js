// @flow

import { createTransform } from 'redux-persist';

export const searchParamTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return '';
  },
  // transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['searchParam'] },
);

export const searchOpenTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return false;
  },
  // transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['searchOpen'] },
);

export const newGroupCoFoundersTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return [];
  },
  // transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['newGroupCoFounders'] },
);

export const notificationsTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return {
      ...inboundState,
      activeNotification: null,
      sessionNotifications: [],
    };
  },
  (outboundState, key) => {
    // remove deprecated state property
    if (outboundState.hasOwnProperty('miscAlreadyNotified')) {
      delete outboundState.miscAlreadyNotified;
    }
    return outboundState;
  },
  { whitelist: ['notifications'] },
);
