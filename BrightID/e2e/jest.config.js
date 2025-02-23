module.exports = {
  preset: 'react-native',
  maxWorkers: 1,
  testTimeout: 120000,
  rootDir: '..',
  testMatch: ['<rootDir>/e2e/**/*.spec.ts'],
  reporters: ['detox/runners/jest/reporter'],
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-navigation|@react-navigation/.*|react-navigation-stack|react-native-screens|@react-native-async-storage/async-storage|react-native-gesture-handler|react-native-platform-touchable|react-native-vector-icons|react-native-spinkit|react-native-image-picker|react-native-svg|react-native-vision-camera|react-native-image-crop-picker|react-native-keychain)/)',
  ],
  setupFiles: ['./jestSetupFile.ts'],
};
