// @flow

import { Buffer } from 'buffer';

export function b64ToUint8Array(str: string) {
  const b = Buffer.from(str, 'base64');
  return new Uint8Array(b.slice());
}

export function strToUint8Array(str: string) {
  const b = Buffer.from(str);
  return new Uint8Array(b.slice());
}

export function uint8ArraytoString(array: Uint8Array) {
  const b = Buffer.from(array);
  return b.toString();
}

export function stringByteLength(str: string) {
  return Buffer.byteLength(str, 'utf8');
}

export const objToUint8 = (obj: {}) => new Uint8Array(Object.values(obj));

export const uInt8ToKeyString = (ary: UInt8Array) =>
  Object.values(ary).join('-');
