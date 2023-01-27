// exactVersionsPreset.js

const { presets } = require('@rnx-kit/align-deps');
const reactNativePreset = presets['microsoft/react-native'];

const profiles = Object.values(reactNativePreset);
for (const profile of profiles) {
  const packages = Object.values(profile);
  for (const pkg of packages) {
    if (pkg.version?.startsWith('^')) {
      pkg.version = pkg.version.slice(1);
    }
  }
}

module.exports = reactNativePreset;
