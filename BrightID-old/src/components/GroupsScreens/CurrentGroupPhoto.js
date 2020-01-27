// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';

class CurrentGroupPhoto extends React.Component<Props> {
  render() {
    const { photo } = this.props;

    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
          }}
          style={styles.photo}
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
  photo: {
    borderRadius: 40,
    width: 80,
    height: 80,
    backgroundColor: '#d8d8d8',
  },
});

export default connect((state) => state)(CurrentGroupPhoto);
