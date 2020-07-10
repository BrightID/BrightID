import { Dimensions, Platform } from 'react-native';

// DEVICE CONSTANTS

export const WIDTH = Dimensions.get('window').width;
export const HEIGHT = Dimensions.get('window').height;

const DEVICE_SMALL_AREA = 240000;

export const DEVICE_TYPE =
  WIDTH * HEIGHT <= DEVICE_SMALL_AREA ? 'small' : 'large';

export const DEVICE_LARGE = DEVICE_TYPE === 'large';

export const DEVICE_SMALL = DEVICE_TYPE === 'small';

export const DEVICE_OS = Platform.OS;

export const DEVICE_ANDROID = DEVICE_OS === 'android';

export const DEVICE_IOS = DEVICE_OS === 'ios';

console.log('width, height, area', WIDTH, HEIGHT, WIDTH * HEIGHT);
console.log('deviceType', DEVICE_TYPE);

export const BOTTOM_NAV_HEIGHT = DEVICE_TYPE === 'small' ? 55 : 63;

// INVITE CONSTANTS

export const INVITE_ACTIVE = 'active';
export const INVITE_REJECTED = 'rejected';
export const INVITE_ACCEPTED = 'accepted';

export const BACKUP_URL = 'https://explorer.brightid.org';

// CONNECTION CONSTANTS
export const QR_TTL = 900000;
export const PROFILE_POLL_INTERVAL = 1000;
export const QR_TYPE_INITIATOR = 'initiator';
export const QR_TYPE_RESPONDER = 'responder';
// timestamp can be this far in the future (milliseconds) to accommodate 2 clients clock differences
export const TIME_FUDGE = 60 * 60 * 1000;

// theme colors
export const ORANGE = '#ED7A5D';

export const MAX_WAITING_SECONDS = 60;
