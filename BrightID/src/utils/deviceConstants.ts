import { Dimensions, Platform } from 'react-native';

/** ** DEVICE CONSTANTS  *** */

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

export const BOTTOM_NAV_HEIGHT = DEVICE_TYPE === 'small' ? 55 : 63;