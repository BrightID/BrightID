import { NativeModules } from 'react-native';
import B64 from 'base64-js';
import { Buffer } from 'buffer';
import CryptoJS from 'crypto-js';
import { compose } from 'ramda';

export const UInt8ArrayEqual = (first: Uint8Array, second: Uint8Array) => {
  // first compare bytelength
  if (first.byteLength !== second.byteLength) return false;
  // bytelength matches, now compare each array element
  return first.every((value, index) => value === second[index]);
};

/**
 *
 * @param {Uint8Array} array
 * @returns {string}
 */
export function uInt8ArrayToB64(array) {
  return B64.fromByteArray(array);
}

/**
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function b64ToUint8Array(str: string): Uint8Array {
  // B64.toByteArray might return a Uint8Array, an Array or an Object depending on the platform.
  // Wrap it in Object.values and new Uint8Array to make sure it's a Uint8Array.
  let arr = B64.toByteArray(str);
  if (arr.join) {
    return arr;
  }
  const plainArray = Object.values(arr);
  arr = new Uint8Array(arr);
  if (arr.join) {
    return arr;
  }
  // TODO Fix this code to solve below typescript error about returning Array<number>
  // instead of UInt8Array. I don't think it makes sense to return a number array here anyway
  // @ts-ignore
  return plainArray;
}

/**
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function strToUint8Array(str) {
  return new Uint8Array(Buffer.from(str, 'ascii'));
}

/**
 *
 * @param {Uint8Obj} obj
 * @returns {number[]}
 */
export const objValues = (obj) => Object.values(obj).map(parseFloat);

/**
 *
 * @param {Uint8Obj} obj
 * @returns {Uint8Array}
 */
export const objToUint8 = (obj) => new Uint8Array(objValues(obj));

/**
 *
 * @param {string} s
 * @returns
 */
export function b64ToUrlSafeB64(s) {
  const alts = {
    '/': '_',
    '+': '-',
    '=': '',
  };
  return s.replace(/[/+=]/g, (c) => alts[c]);
}

export const objToB64 = compose(uInt8ArrayToB64, objToUint8);

/**
 *
 * @param {string} data
 * @returns
 */
export const hash = (data) => {
  const h = CryptoJS.SHA256(data);
  const b = h.toString(CryptoJS.enc.Base64);
  return b64ToUrlSafeB64(b);
};

const { RNRandomBytes } = NativeModules;
/**
 *
 * @param {number} size
 * @returns
 */
export const randomKey = (size: number) =>
  new Promise<string>((resolve, reject) => {
    RNRandomBytes.randomBytes(size, (err, bytes) => {
      err ? reject(err) : resolve(bytes);
    });
  });

export const urlSafeRandomKey = async (size = 9) => {
  const key = await randomKey(size);
  return b64ToUrlSafeB64(key);
};
