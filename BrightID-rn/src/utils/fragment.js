// @flow

import { strToUint8Array } from './encoding';

// max byte length we can safely send via rtc data channels
const BYTES = 600;

// helper function for fragmenting strings of a certain size
const fragment = (str: string) => {
  const fragments = [];
  const l = str.length;
  if (l <= BYTES) {
    fragments.push(strToUint8Array(str));
    console.warn(strToUint8Array(str).byteLength);
  } else {
    for (let i = l; i >= BYTES; i -= BYTES) {
      fragments.push(strToUint8Array(str.slice(i - BYTES, i)));
      console.warn(strToUint8Array(str.slice(i - BYTES, i)));
    }
  }
  return fragments;
};

export default fragment;
