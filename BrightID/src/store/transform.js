// @flow

import { createTransform } from 'redux-persist';

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
