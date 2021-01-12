/* eslint-disable import/no-extraneous-dependencies */

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockAsyncStorage from 'mock-async-storage';
import { randomBytes } from 'crypto';

// jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

configure({ adapter: new Adapter() });

const mockImpl = new MockAsyncStorage();
jest.mock('@react-native-async-storage/async-storage', () => mockImpl);

jest.mock(
  './src/components/Connections/SearchConnections',
  () => 'SearchConnections',
);

jest.mock('react-native', () => {
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
