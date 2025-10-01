// keychainMock.ts or keychainMock.js

const keychainMock = {
  SECURITY_LEVEL: {
    SECURE_SOFTWARE: 'MOCK_SECURITY_LEVEL_SECURE_SOFTWARE',
    SECURE_HARDWARE: 'MOCK_SECURITY_LEVEL_SECURE_HARDWARE',
    ANY: 'MOCK_SECURITY_LEVEL_ANY',
  },
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'MOCK_AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'MOCK_AccessibleAfterFirstUnlock',
    ALWAYS: 'MOCK_AccessibleAlways',
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY:
      'MOCK_AccessibleWhenPasscodeSetThisDeviceOnly',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'MOCK_AccessibleWhenUnlockedThisDeviceOnly',
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
      'MOCK_AccessibleAfterFirstUnlockThisDeviceOnly',
  },
  ACCESS_CONTROL: {
    USER_PRESENCE: 'MOCK_UserPresence',
    BIOMETRY_ANY: 'MOCK_BiometryAny',
    BIOMETRY_CURRENT_SET: 'MOCK_BiometryCurrentSet',
    DEVICE_PASSCODE: 'MOCK_DevicePasscode',
    APPLICATION_PASSWORD: 'MOCK_ApplicationPassword',
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'MOCK_BiometryAnyOrDevicePasscode',
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE:
      'MOCK_BiometryCurrentSetOrDevicePasscode',
  },
  AUTHENTICATION_TYPE: {
    DEVICE_PASSCODE_OR_BIOMETRICS:
      'MOCK_AuthenticationWithBiometricsDevicePasscode',
    BIOMETRICS: 'MOCK_AuthenticationWithBiometrics',
  },
  STORAGE_TYPE: {
    FB: 'MOCK_FacebookConceal',
    AES: 'MOCK_KeystoreAESCBC',
    RSA: 'MOCK_KeystoreRSAECB',
    KC: 'MOCK_keychain',
  },
  setGenericPassword: jest.fn().mockResolvedValue({
    service: 'mockService',
    storage: 'mockStorage',
  }),
  getGenericPassword: jest.fn().mockResolvedValue({
    username: 'mockUser',
    password: 'mockPassword',
    service: 'mockService',
    storage: 'mockStorage',
  }),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  hasGenericPassword: jest.fn().mockResolvedValue(true),
  getAllGenericPasswordServices: jest
    .fn()
    .mockResolvedValue(['mockService1', 'mockService2']),
  setInternetCredentials: jest.fn().mockResolvedValue({
    service: 'mockService',
    storage: 'mockStorage',
  }),
  getInternetCredentials: jest.fn().mockResolvedValue({
    username: 'mockUser',
    password: 'mockPassword',
    service: 'mockService',
    storage: 'mockStorage',
  }),
  resetInternetCredentials: jest.fn().mockResolvedValue(''),
  getSupportedBiometryType: jest.fn().mockResolvedValue('MOCK_TouchID'),
  canImplyAuthentication: jest.fn().mockResolvedValue(true),
  getSecurityLevel: jest.fn().mockResolvedValue('MOCK_SECURE_SOFTWARE'),
};

export default keychainMock;
