// @flow

import { Buffer } from 'buffer';

export function uInt8ArrayToB64(array: Uint8Array) {
    const b = Buffer.from(array);
    return b.toString('base64');
}

export function str2b64(str: string) {
  const b = Buffer.from(str);
  return b.toString('base64');
}

export function strToUint8Array(str: string) {
  const b = Buffer.from(str);
  return new Uint8Array(b.slice());
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
