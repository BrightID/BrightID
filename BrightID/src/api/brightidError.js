/* In case backend does not provide an errorNum */
export const UNKNOWN_ERRORNUM = 0;
/* Error numbers copied from foxx/brightId/errors.js */
export const CONTEXT_NOT_FOUND = 1;
export const CONTEXTID_NOT_FOUND = 2;
export const NOT_VERIFIED = 3;
export const NOT_SPONSORED = 4;
export const KEYPAIR_NOT_SET = 6;
export const ETHPRIVATEKEY_NOT_SET = 7;
export const OPERATION_NOT_FOUND = 9;
export const USER_NOT_FOUND = 10;
export const IP_NOT_SET = 11;
export const APP_NOT_FOUND = 12;
export const INVALID_EXPRESSION = 13;
export const INVALID_TESTING_KEY = 14;
export const INVALID_PASSCODE = 15;
export const PASSCODE_NOT_SET = 16;
export const GROUP_NOT_FOUND = 17;
export const INVALID_OPERATION_NAME = 18;
export const INVALID_SIGNATURE = 19;
export const TOO_MANY_OPERATIONS = 20;
export const INVALID_OPERATION_VERSION = 21;
export const INVALID_TIMESTAMP = 22;
export const NOT_RECOVERY_CONNECTIONS = 23;
export const INVALID_HASH = 24;
export const OPERATION_APPLIED_BEFORE = 25;
export const TOO_BIG_OPERATION = 26;
export const INELIGIBLE_NEW_USER = 27;
export const ALREADY_HAS_PRIMARY_GROUP = 28;
export const NEW_USER_BEFORE_FOUNDERS_JOIN = 29;
export const INVALID_GROUP_TYPE = 30;
export const DUPLICATE_GROUP = 31;
export const INVALID_COFOUNDERS = 32;
export const INELIGIBLE_NEW_ADMIN = 33;
export const NOT_INVITED = 34;
export const LEAVE_GROUP = 35;
export const DUPLICATE_CONTEXTID = 36;
export const TOO_MANY_LINK_REQUEST = 37;
export const UNUSED_SPONSORSHIPS = 38;
export const SPONSORED_BEFORE = 39;
export const SPONSOR_NOT_SUPPORTED = 40;
export const NOT_ADMIN = 41;
export const ARANGO_ERROR = 42;

class BrightidError extends Error {
  constructor(data, ...params) {
    super(...params);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BrightidError);
    }
    this.name = 'BrightidError';
    // Store custom error information from brightID api response
    this.message = data.errorMessage;
    this.errorNum = data.errorNum || UNKNOWN_ERRORNUM;
    this.errorCode = data.code;
  }
}

export default BrightidError;
