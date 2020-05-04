// eslint-disable-next-line import/no-extraneous-dependencies
const defaultSourceExts = require('metro-config/src/defaults/defaults')
  .sourceExts;

/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    // enable mocking for detox E2E tests (https://github.com/wix/Detox/blob/master/docs/Guide.Mocking.md)
    sourceExts: process.env.RN_SRC_EXT
      ? process.env.RN_SRC_EXT.split(',').concat(defaultSourceExts)
      : defaultSourceExts,
  },
};
