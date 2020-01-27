// @flow

export const verifyStore = (data: State) =>
  typeof data.name === 'string' &&
  typeof data.score === 'number' &&
  typeof data.groupsCount === 'number' &&
  data.photo &&
  typeof data.photo.filename === 'string' &&
  Array.isArray(data.currentGroups) &&
  Array.isArray(data.connections) &&
  Array.isArray(data.verifications) &&
  Array.isArray(data.apps);
