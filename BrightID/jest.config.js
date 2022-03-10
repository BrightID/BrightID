module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFiles: [
    './jestSetupFile.js',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-navigation|@react-navigation/.*|react-navigation-stack|react-native-screens|@react-native-async-storage/async-storage|react-native-gesture-handler|react-native-platform-touchable|react-native-vector-icons|react-native-spinkit|react-native-image-picker|react-native-svg|react-native-camera|react-native-image-crop-picker|react-native-keychain)/)',
  ],
  testPathIgnorePatterns: ['./e2e/'],
};
