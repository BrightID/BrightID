// @flow

export const verifyStore = (data: State) =>
  typeof data.name === 'string' &&
  typeof data.score === 'number' &&
  data.photo &&
  typeof data.photo.filename === 'string' &&
  Array.isArray(data.connections) &&
  Array.isArray(data.verifications) &&
  Array.isArray(data.apps) &&
  typeof data.id === 'string' &&
  data.secretKey instanceof Uint8Array;
