export const enum RecoveryErrorType {
  NONE = 'NONE',
  GENERIC = 'GENERIC',
  MISMATCH_ID = 'MISMATCH_ID',
}

export class RecoveryError extends Error {
  errorType: RecoveryErrorType;

  constructor(type: RecoveryErrorType) {
    super();
    this.name = this.constructor.name;
    this.errorType = type;
  }
}
