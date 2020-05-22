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

// CONNECTION CONSTANTS
export const QR_TTL = 600000;
export const PROFILE_POLL_INTERVAL = 1000;
