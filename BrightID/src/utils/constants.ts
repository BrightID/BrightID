/** ** INVITE CONSTANTS  *** */

export const LOCAL_HTTP_SERVER_PORT = 9025;

export const INVITE_ACTIVE = 'active';
export const INVITE_REJECTED = 'rejected';
export const INVITE_ACCEPTED = 'accepted';

export const group_states = {
  INITIATED: 'initiated',
  VERIFIED: 'verified',
  DISMISSED: 'dismissed',
};

export const BACKUP_URL = 'https://explorer.brightid.org';

// helpers for time constants (milliseconds)
const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const day = 24 * hour;

// Operation & API constants
// Max. time to wait for operation result
export const OPERATION_TRACE_TIME = 2 * minute;

// Max. time to wait for app to finish updating blind signatures
export const UPDATE_BLIND_SIG_WAIT_TIME = 2 * minute;
// How long to keep "done" operations (success, failed or expired) in local redux store
export const LOCAL_OPERATION_KEEP_THRESHOLD = 7 * day;
export const operation_states = {
  UNKNOWN: 'unknown',
  INIT: 'init',
  SENT: 'sent',
  APPLIED: 'applied',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

// CONNECTION CONSTANTS
export const PROFILE_VERSION = 1;
export const MAX_TOTAL_CHANNELS = 20; // max number of channels client can create
export const SINGLE_CHANNEL_TTL = 24 * hour;
export const GROUP_CHANNEL_TTL = 15 * minute;
export const STAR_CHANNEL_TTL = 30 * minute;
export const GROUP_CHANNEL_CONNECTION_LIMIT = 30; // maximum number of connections allowed in group channel.
export const STAR_CHANNEL_CONNECTION_LIMIT = 50; // max number of connections allowed in star channel.
export const MIN_CHANNEL_JOIN_TTL = 5 * second; // minimum TTL a channel should still have when joining.
export const PROFILE_POLL_INTERVAL = 2 * second;
export const POSSIBLE_DUPLICATE_STRING_SIMILARITY_RATE = 0.6;
export const MAX_DISPLAY_CONNECTIONS = 200;
export const MAX_CONNECTIONS_DUPLICATE_SEARCH = 1000;
export const CONNECTION_STALE_AGE = 15 * minute;

export const RECOVERY_COOLDOWN_DURATION = 7 * day;
export const RECOVERY_COOLDOWN_EXEMPTION = 24 * hour;

// App linking and sponsoring
export const SPONSORING_POLL_INTERVAL = 5 * second;

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
export const CHANNEL_UPLOAD_RETRY_COUNT = 5; // max number of upload retries when upload failed
export const CHANNEL_UPLOAD_RETRY_INTERVAL = 5 * second; // ms to wait between retries
export const RECOVERY_CHANNEL_TTL = day;

//* * ** THEME CONSTANTS  *** */
export const ORANGE = '#ED7A5D';
export const LIGHTBLUE = '#4A90E2';
export const DARK_ORANGE = '#B64B32';

/** Nodechooser constants * */
export const NODE_CHOOSER_TIMEOUT_MS = 20 * second; // Fail if no valid node found within timeout
export const requiredSemVer = '^6.17.2'; // client requires this node version

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
  REPLACED: 'replaced',
  OTHER: 'other',
};

export enum qrCodeURL_types {
  CONNECTION = '1', // qrcode url is for connection channel
  RECOVERY = '2', // qrcode url is for recovery channel
  IMPORT = '3', // qrcode url is for import channel
  SYNC = '4', // qrcode url is for syncing devices channel
  ADD_SUPER_APP = '5', // qrcode url is for adding super app
}

export enum report_sources {
  PREVIEW = 'preview',
  RECONNECT = 'reconnect',
  PROFILE = 'profile',
}

export enum recover_steps {
  NOT_STARTED,
  POLLING_SIGS,
  RESTORING,
  ERROR,
  COMPLETE,
}

export const SOCIAL_MEDIA_SIG_WAIT_TIME = day;
export const DEFAULT_SHARE_WITH_CONNECTIONS_VALUE = true;

export enum channel_types {
  GROUP = 'GROUP',
  SINGLE = 'SINGLE',
  STAR = 'STAR',
}

export enum channel_states {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  BACKGROUND = 'BACKGROUND',
}

export enum app_linking_steps {
  IDLE,
  // Preparation
  REFRESHING_APPS,
  WAITING_USER_CONFIRMATION,
  USER_CONFIRMED,
  // Check preconditions
  PRELINK_CHECK,
  PRELINK_CHECK_PASSED,
  // Sponsoring
  SPONSOR_WAITING_OP, // Op to request sponsoring submitted to node and waiting for op to confirm
  SPONSOR_SUCCESS, // got sponsored
  // Linking
  LINK_WAITING_V5, // Waiting for link operation to confirm (v5 app)
  LINK_WAITING_V6, // Waiting for link function to complete (v6 app)
  LINK_SUCCESS,
}

export enum BrightIdNetwork {
  TEST = 'test',
  NODE = 'node',
}

export const discordUrl = 'https://discord.gg/nTtuB2M';

// Max time to keep logfiles
export const LOGFILE_KEEP_DURATION = 3 * day;

export const DEEP_LINK_PREFIX = 'brightid://';
export const UNIVERSAL_LINK_PREFIX = 'https://app.brightid.org/';
