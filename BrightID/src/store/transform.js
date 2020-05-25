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
    return { ...inboundState, searchParam: '' };
  },
  (outboundState, key) => {
    return outboundState;
  },
  { whitelist: ['groups'] },
);
