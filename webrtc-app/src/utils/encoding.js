import { Buffer } from 'buffer';

export function b64ToUint8Array(str) {
  const b = Buffer.from(str, 'base64');
  return new Uint8Array(b.slice());
}

export function strToUint8Array(str) {
  const b = Buffer.from(str);
  return new Uint8Array(b.slice());
}
