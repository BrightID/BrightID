// @flow

export const verifyStore = (data: State) =>
  typeof data.name === 'string' &&
  typeof data.score === 'number' &&
  data.photo &&
  typeof data.photo.filename === 'string' &&
  Array.isArray(data.connections) &&
  Array.isArray(data.verifications) &&
  Array.isArray(data.apps) &&
  Array.isArray(data.groups) &&
  Array.isArray(data.invites) &&
  typeof data.id === 'string' &&
  data.secretKey instanceof Uint8Array;
