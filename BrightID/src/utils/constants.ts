/** ** INVITE CONSTANTS  *** */

export const INVITE_ACTIVE = 'active';
export const INVITE_REJECTED = 'rejected';
export const INVITE_ACCEPTED = 'accepted';

export const BACKUP_URL = 'https://explorer.brightid.org';

// Operation & API constants
// Max. time to wait for operation result
export const OPERATION_TRACE_TIME = 2 * 60 * 1000; // 2 minutes
// How long to keep "done" operations (success, failed or expired) in local redux store
export const LOCAL_OPERATION_KEEP_THRESHOLD = 60 * 60 * 24 * 7 * 1000; // 1 week
export const operation_states = {
  UNKNOWN: 'unknown',
  INIT: 'init',
  SENT: 'sent',
  APPLIED: 'applied',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

// CONNECTION CONSTANTS
export const CHANNEL_TTL = 900000; // 15 minutes
export const CHANNEL_CONNECTION_LIMIT = 30; // maximum number of connections allowed in channel.
export const MIN_CHANNEL_JOIN_TTL = 5000;
export const PROFILE_POLL_INTERVAL = 2000;
export const RECOVERY_CHANNEL_KEEPALIVE_THRESHOLD = 30000;
export const RECOVERY_COOLDOWN_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week
export const RECOVERY_COOLDOWN_EXEMPTION = 24 * 60 * 60 * 1000; // 24 hours
export const PROFILE_VERSION = 1;
export const POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE = 0.6;
export const MAX_DISPLAY_CONNECTIONS = 200;

// Channel info
export const CHANNEL_INFO_NAME = 'channelInfo.json';
export const CHANNEL_INFO_VERSION_1 = 1; // Initial channel info format
export const CHANNEL_INFO_VERSION_2 = 2; // Adds STAR channel type
// the oldest channel info format the client understands.
export const MIN_CHANNEL_INFO_VERSION = CHANNEL_INFO_VERSION_1;
// the newest channel info format the client understands.
export const MAX_CHANNEL_INFO_VERSION = CHANNEL_INFO_VERSION_2;
// TODO: Set dedicated prefix for importing once node backends are updated
export const IMPORT_PREFIX = 'sig_';
export const CHANNEL_FULL_RETRY_COUNT = 5; // max number of upload retries when channel is full
export const CHANNEL_FULL_RETRY_INTERVAL = 5000; // ms to wait between retries

//* * ** THEME CONSTANTS  *** */
export const ORANGE = '#ED7A5D';
export const LIGHTBLUE = '#4A90E2';
export const DARK_ORANGE = '#B64B32';

/** Nodechooser constants * */
export const NODE_CHOOSER_TIMEOUT_MS = 20 * 1000; // Fail if no valid node found within timeout
export const requiredSemVer = '^6.3.0'; // client requires this node version

/** ** NOTIFICATION CONSTANTS  *** */
export const CONNECTIONS_TYPE = 'connections';
export const GROUPS_TYPE = 'groups';
export const MISC_TYPE = 'misc';
export const NONE_TYPE = 'none';
export const MIN_CONNECTIONS_FOR_RECOVERY_NOTIFICATION = 3;
export const MIN_RECOVERY_CONNECTIONS = 3;

/** ** CONNECTION CONFIDENCE LEVELS *** */

export const connection_levels = {
  REPORTED: 'reported',
  SUSPICIOUS: 'suspicious',
  JUST_MET: 'just met',
  ALREADY_KNOWN: 'already known',
  RECOVERY: 'recovery',
} as const;

export const report_reasons = {
  FAKE: 'fake',
  DUPLICATE: 'duplicate',
  SPAMMER: 'spammer',
  DECEASED: 'deceased',
  OTHER: 'other',
};

export enum qrCodeURL_types {
  CONNECTION = '1', // qrcode url is for connection channel
  RECOVERY = '2', // qrcode url is for recovery channel
  IMPORT = '3', // qrcode url is for import channel
  SYNC = '4', // qrcode url is for syncing devices channel
}

export const SOCIAL_MEDIA_SIG_WAIT_TIME = 86400000;
