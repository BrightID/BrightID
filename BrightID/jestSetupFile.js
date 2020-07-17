/* eslint-disable import/no-extraneous-dependencies */
// import mockAsyncStorage from '@react-native-community/async-storage/jest/async-storage-mock';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockAsyncStorage from 'mock-async-storage';
import { NativeModules } from 'react-native';
import { randomBytes } from 'crypto';

// jest.mock('@react-native-community/async-storage', () => mockAsyncStorage);

configure({ adapter: new Adapter() });

const mockImpl = new MockAsyncStorage();
jest.mock('@react-native-community/async-storage', () => mockImpl);

jest.mock(
  './src/components/Connections/SearchConnections',
  () => 'SearchConnections',
);

NativeModules.RNRandomBytes = {
  randomBytes: (size, cb) => {
    let buf = randomBytes(size);
    cb(null, buf.toString('hex').slice(size));
  },
};
