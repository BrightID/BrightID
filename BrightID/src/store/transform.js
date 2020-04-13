// @flow

import { createTransform } from 'redux-persist';
import { objToUint8 } from '@/utils/encoding';

const transformer = createTransform(
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

export default transformer;
