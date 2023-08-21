module.exports = {
  preset: 'react-native',
  maxWorkers: 1,
  testEnvironment: './e2e/environment',
  testRunner: 'jest-circus/runner',
  testTimeout: 120000,
  testRegex: '\\.spec\\.ts$',
  reporters: ['detox/runners/jest/streamlineReporter'],
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-navigation|@react-navigation/.*|react-navigation-stack|react-native-screens|@react-native-async-storage/async-storage|react-native-gesture-handler|react-native-platform-touchable|react-native-vector-icons|react-native-animated-spinkit|react-native-image-picker|react-native-svg|expo-camera|react-native-image-crop-picker|react-native-keychain)/)',
  ],
  setupFiles: ['./jestSetupFile.ts'],
};
