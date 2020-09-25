// @flow

import { createTransform } from 'redux-persist';

export const userTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return { ...inboundState, searchParam: '' };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['user'] },
);

/*
  clear searchParam of SearchGroups when persisting
 */
export const groupsTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return {
      ...inboundState,
      searchParam: '',
      searchOpen: false,
      newGroupCoFounders: [],
    };
  },
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['groups'] },
);

/*
  clear searchParam of SearchConnections when persisting
 */
export const connectionsTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return { ...inboundState, searchParam: '', searchOpen: false };
  },
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['connections'] },
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

/* clear my QRCode when persisting */
export const qrDataTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return { ...inboundState, myQrData: undefined };
  },
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['connectQrData'] },
);
