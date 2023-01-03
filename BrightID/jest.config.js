module.exports = {
  preset: '@testing-library/react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: [
    './jestSetupFile.ts',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)',
  ],
  testPathIgnorePatterns: ['./e2e/'],
};
