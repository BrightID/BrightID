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

  /*

  // mock modules/components created by assigning to NativeModules
  RN.NativeModules.ReanimatedModule = {
    configureProps: jest.fn(),
    createNode: jest.fn(),
    connectNodes: jest.fn(),
    connectNodeToView: jest.fn()
  };

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
