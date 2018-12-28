// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';

/**
 * Avatar Picture displayed on the HomeScreen
 * The Image is sourced from the main reducer as avatar
 * @prop avatar is a filename - avatars located in ~/documents/avatar
 */

type Props = {
  avatar: string,
};

class CurrentGroupAvatar extends React.Component<Props> {
  render() {
    const { avatar } = this.props;

    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
              avatar.filename
            }`,
          }}
          style={styles.avatar}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  avatar: {
    borderRadius: 40,
    width: 80,
    height: 80,
    backgroundColor: '#d8d8d8',
  },
});

export default connect((state) => state.main)(CurrentGroupAvatar);
