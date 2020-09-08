// @flow

import { DEFAULT_OP_TRACE_TIME, MAX_OP_TRACE_TIME } from '../utils/constants';

export const ADD_OPERATION = 'ADD_OPERATION';
export const REMOVE_OPERATION = 'REMOVE_OPERATION';
export const RESET_OPERATIONS = 'RESET_OPERATIONS';

export const addOperation = (op: operation) => {
  if (!op.tracetime) {
    op.tracetime = DEFAULT_OP_TRACE_TIME;
  }
  if (op.tracetime > MAX_OP_TRACE_TIME) {
    console.log(
      `operation tracetime ${op.tracetime} too high, reducing to ${MAX_OP_TRACE_TIME}`,
    );
    op.tracetime = MAX_OP_TRACE_TIME;
  } else if (op.tracetime < 0) {
    console.log(
      `operation tracetime ${op.tracetime} too low, increasing to ${DEFAULT_OP_TRACE_TIME}`,
    );
    op.tracetime = DEFAULT_OP_TRACE_TIME;
  }

  return {
    type: ADD_OPERATION,
    op,
  };
};

export const removeOperation = (opHash: string) => ({
  type: REMOVE_OPERATION,
  opHash,
});

export const resetOperations = () => ({
  type: RESET_OPERATIONS,
});
