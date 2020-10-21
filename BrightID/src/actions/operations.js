// @flow

export const ADD_OPERATION = 'ADD_OPERATION';
export const REMOVE_OPERATION = 'REMOVE_OPERATION';
export const RESET_OPERATIONS = 'RESET_OPERATIONS';
export const APP_VERSION = 'APP_VERSION';

export const addOperation = (op: operation) => ({
  type: ADD_OPERATION,
  op,
});

export const removeOperation = (opHash: string) => ({
  type: REMOVE_OPERATION,
  opHash,
});

export const resetOperations = () => ({
  type: RESET_OPERATIONS,
});

export const setAppVersion = (appVersion, label) => ({
  type: APP_VERSION,
  appVersion,
  label,
});
