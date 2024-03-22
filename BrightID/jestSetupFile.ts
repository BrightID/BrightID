/* eslint-disable import/no-extraneous-dependencies */
import MockAsyncStorage from 'mock-async-storage';
import { NodeApi } from './src/api/brightId';
import { hash } from './src/utils/encoding';

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
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-modpow', () => {});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// useHeaderHeight hook
jest.mock('@react-navigation/elements', () => ({
  useHeaderHeight: jest.fn().mockImplementation(() => 200),
}));

const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn().mockImplementation(() => true),
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigation.navigate,
      dispatch: mockNavigation.dispatch,
      goBack: mockNavigation.goBack,
      isFocused: mockNavigation.isFocused,
    }),
    useRoute: () => ({
      name: 'testRoute',
      params: {},
    }),
    useFocusEffect: jest.fn(), // .mockImplementation((func) => func()),
  };
});

// useDrawerStatus hook
jest.mock('@react-navigation/drawer', () => ({
  useDrawerStatus: jest.fn().mockImplementation(() => false),
}));

// nodeAPI checkhash static method
jest.spyOn(NodeApi, 'checkHash').mockImplementation((response, message) => {
  // original 'checkHash' implementation compares the local calculated hash
  //  with the server provided hash. Skip this check for testing
  //  and just use the local hash
  return hash(message);
});

// nodeAPI instance
const mockApi = new NodeApi({
  // we will intercept any request using msw so the url does not matter
  url: 'https://not.valid',
  id: undefined,
  secretKey: undefined,
});
jest.mock('BrightID/src/context/NodeApiContext', () => {
  const originalModule = jest.requireActual(
    'BrightID/src/context/NodeApiContext',
  );
  return {
    ...originalModule,
    getGlobalNodeApi: () => mockApi,
  };
});

// decrease timeouts and intervals used for
//  checking operation state etc, so tests run faster
jest.mock('@/utils/constants', () => {
  const originalModule = jest.requireActual('@/utils/constants');
  return {
    ...originalModule,
    SPONSORING_POLL_INTERVAL: 50,
  };
});
