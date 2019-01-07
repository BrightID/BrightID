// @flow

import B64 from 'base64-js';
import { Buffer } from 'buffer';

export function uInt8ArrayToB64(array: Uint8Array) {
    const b = Buffer.from(array);
    return b.toString('base64');
}

export function b64ToUint8Array (str){
  return new Uint8Array(B64.toByteArray(str));
}

export function strToUint8Array(str: string) {
  return new Uint8Array(Buffer.from(str, 'ascii'));
}

export const objToUint8 = (obj: {}) => new Uint8Array(Object.values(obj));

export function b64ToUrlSafeB64(s: string) {
  const alts = {
    '/': '_',
    '+': '-',
    '=': ''
  };
  return s.replace(/[/+=]/g, (c) => alts[c]);
}
