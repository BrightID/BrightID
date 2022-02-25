/* eslint-disable import/no-extraneous-dependencies */

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockAsyncStorage from 'mock-async-storage';

configure({ adapter: new Adapter() });

const mockImpl = new MockAsyncStorage();
jest.mock('@react-native-async-storage/async-storage', () => mockImpl);

jest.mock('react-native', () => {
  const { randomBytes } = require('crypto');
  return {
    Dimensions: {
      get: () => {
        return {
          width: 100,
          height: 100,
        };
      },
    },
    InteractionManager: {
      runAfterInteractions: jest.fn(),
      createInteractionHandle: jest.fn(),
      clearInteractionHandle: jest.fn(),
      setDeadline: jest.fn(),
    },
    NativeModules: {
      RNRandomBytes: {
        randomBytes: (size, cb) => {
          let buf = randomBytes(size);
          cb(null, buf.toString('base64'));
        },
      },
    },
    Platform: {
      OS: 'ios',
    },
  };
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
