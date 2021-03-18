/** ** INVITE CONSTANTS  *** */

export const INVITE_ACTIVE = 'active';
export const INVITE_REJECTED = 'rejected';
export const INVITE_ACCEPTED = 'accepted';

export const BACKUP_URL = 'https://explorer.brightid.org';

// CONNECTION CONSTANTS
export const CHANNEL_TTL = 900000; // 15 minutes
export const CHANNEL_CONNECTION_LIMIT = 30; // maximum number of connections allowed in channel.
export const MIN_CHANNEL_JOIN_TTL = 5000;
export const PROFILE_POLL_INTERVAL = 2000;
export const RECOVERY_CHANNEL_KEEPALIVE_THRESHOLD = 30000;
export const RECOVERY_COOLDOWN_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week
export const RECOVERY_COOLDOWN_EXEMPTION = 24 * 60 * 60 * 1000; // 24 hours
// timestamp can be this far in the future (milliseconds) to accommodate 2 clients clock differences
export const TIME_FUDGE = 60 * 60 * 1000;
export const PROFILE_VERSION = 1;
export const CHANNEL_INFO_NAME = 'channelInfo.json';
export const CHANNEL_INFO_VERSION = 1;
//* * ** THEME CONSTANTS  *** */
export const ORANGE = '#ED7A5D';
export const LIGHTBLUE = '#4A90E2';
export const DARK_ORANGE = '#B64B32';

/** ** NOTIFICATION CONSTANTS  *** */
export const CONNECTIONS_TYPE = 'connections';
export const GROUPS_TYPE = 'groups';
export const MISC_TYPE = 'misc';
export const NONE_TYPE = 'none';
export const MIN_CONNECTIONS_FOR_RECOVERY_NOTIFICATION = 3;
export const MIN_RECOVERY_CONNECTIONS = 3;

/** ** CONNECTION CONFIDENCE LEVELS *** */
type connection_levels = typeof connection_levels[keyof typeof connection_levels];
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
