/* eslint-disable import/no-extraneous-dependencies */
import MockAsyncStorage from 'mock-async-storage';

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

jest.mock('@react-native-async-storage/async-storage', () => {
  return new MockAsyncStorage();
});

jest.mock('react-native', () => {
  // use original implementation, which comes with mocks out of the box
  const RN = jest.requireActual('react-native');

  // mock randomBytes module
  const { randomBytes } = require('crypto');
  RN.NativeModules.RNRandomBytes = {
    randomBytes: (size, cb) => {
      const buf = randomBytes(size);
      cb(null, buf.toString('base64'));
    },
  };

  // mock modules/components created by assigning to NativeModules
  RN.NativeModules.ReanimatedModule = {
    configureProps: jest.fn(),
    createNode: jest.fn(),
    connectNodes: jest.fn(),
    connectNodeToView: jest.fn(),
  };

  /*

  // mock modules created through UIManager
  RN.UIManager.getViewManagerConfig = name => {
    if (name === "SomeNativeModule") {
      return {someMethod: jest.fn()}
    }
    return {};
  };

 */

  return RN;
});

jest.mock('react-native-keychain', () => {
  const genericPassword = {
    username: JSON.stringify({ publicKey: '', version: 1 }),
    password: 'abcd',
  };
  return {
    SECURITY_LEVEL_ANY: 'SECURITY_LEVEL_ANY',
    SECURITY_LEVEL_SECURE_SOFTWARE: 'SECURITY_LEVEL_SECURE_SOFTWARE',
    SECURITY_LEVEL_SECURE_HARDWARE: 'SECURITY_LEVEL_SECURE_HARDWARE',
    setGenericPassword: () => Promise.resolve(true),
    setInternetCredentials: () => Promise.resolve(true),
    resetGenericPassword: () => Promise.resolve(true),
    getGenericPassword: () => Promise.resolve(genericPassword),
  };
});

/* just here to satisfy the import statement. Needs to be stubbed out further if actually used */
jest.mock('react-native-modpow', () => {});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// useHeaderHeight hook
jest.mock('@react-navigation/stack', () => ({
  useHeaderHeight: jest.fn().mockImplementation(() => 200),
}));
