// @flow

export const objToUint8 = (obj) => {
  return new Uint8Array(Object.values(obj));
};
