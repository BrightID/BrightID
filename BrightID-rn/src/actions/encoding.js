export function b64ToUint8Array(str) {
  var b = new Buffer(str, 'base64');
  return new Uint8Array(b.slice());
}

export function strToUint8Array(str) {
  var b = new Buffer(str);
  return new Uint8Array(b.slice());
}
