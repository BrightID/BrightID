// @flow

import * as React from 'react';
import { Image, StyleSheet } from 'react-native';

/**
 * Verification Stickers
 * @prop name
 */

export default class VerificationSticker extends React.PureComponent<Props> {
  imagePath = (name) => {
    switch (name) {
      case 'DollarForEveryone':
        return require('../../static/verifications/DollarForEveryone.png');
      case 'BrightID':
        return require('../../static/verifications/BrightID.png');
      case 'NodeOne':
        return require('../../static/verifications/NodeOne.png');
      default:
        return false;
    }
  };

  render() {
    const { name } = this.props;
    const imagePath = this.imagePath(name);

    if (imagePath) {
      return <Image source={imagePath} style={styles.verificationSticker} />;
    }
  }
}

const styles = StyleSheet.create({
  verificationSticker: {},
});
