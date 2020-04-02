// @flow

import { createTransform } from 'redux-persist';
import { objToUint8 } from '@/utils/encoding';

const transformer = createTransform(
  // transform state on its way to being serialized and persisted.
  (inboundState, key) => {
    // convert mySet to an Array.
    console.log('inboundState', inboundState);
    console.log('inboundKey', key);
    return { ...inboundState };
  },
  // transform state being rehydrated
  (outboundState, key) => {
    // convert mySet back to a Set.
    console.log('outboundState', outboundState);
    console.log('outboundKey', key);
    const secretKey = objToUint8(outboundState.user.secretKey);
    return { ...outboundState };
  },
);

export default transformer;
