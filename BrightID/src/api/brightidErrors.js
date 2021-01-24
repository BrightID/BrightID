/* Error numbers copied from foxx/brightId/index.js */
export const CONTEXT_NOT_FOUND = 1;
export const CONTEXTID_NOT_FOUND = 2;
export const CAN_NOT_BE_VERIFIED = 3;
export const NOT_SPONSORED = 4;
export const OLD_ACCOUNT = 5;
export const KEYPAIR_NOT_SET = 6;
export const ETHPRIVATEKEY_NOT_SET = 7;
export const OPERATION_NOT_FOUND = 9;
export const USER_NOT_FOUND = 10;
export const IP_NOT_SET = 11;
export const APP_NOT_FOUND = 12;
export const INVALID_EXPRESSION = 13;
export const INVALID_TESTING_KEY = 14;
export const INCORRECT_PASSCODE = 15;
export const PASSCODE_NOT_SET = 16;
export const GROUP_NOT_FOUND = 17;

class ApiError extends Error {
  constructor(data, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
    this.name = 'ApiError';
    // Custom information
    this.errorNum = data.errorNum;
    this.errorMessage = data.errorMessage;
    this.errorCode = data.code;
  }
}

export default ApiError;
