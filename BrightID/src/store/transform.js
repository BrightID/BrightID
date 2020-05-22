// @flow

import { createTransform } from 'redux-persist';
import { objToUint8 } from '@/utils/encoding';

export const userTransformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    return { ...inboundState, searchParam: '' };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    const secretKey = objToUint8(outboundState.secretKey);
    return { ...outboundState, secretKey };
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
