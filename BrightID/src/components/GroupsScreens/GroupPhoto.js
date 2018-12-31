// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import { groupCirclePhotos } from '../../utils/groups';

class GroupPhoto extends React.Component {

  render() {
    const circlePhotos = groupCirclePhotos(this.props.group);

    return (
      <View style={styles.container}>
        <View style={styles.topPhotos}>
          {circlePhotos[0] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${
                  circlePhotos[0].photo.filename
                }`,
              }}
              style={[styles.photo, circlePhotos[0].faded ? styles.faded : '']}
            />
          )}
        </View>
        <View style={styles.bottomPhotos}>
          {circlePhotos[1] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${
                  circlePhotos[1].photo.filename
                }`,
              }}
              style={[styles.photo, circlePhotos[1].faded ? styles.faded : '']}
            />
          )}
          {circlePhotos[2] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${
                  circlePhotos[2].photo.filename
                }`,
              }}
              style={[styles.photo, circlePhotos[2].faded ? styles.faded : '']}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: 85,
  },
  photo: {
    borderRadius: 20,
    width: 40,
    height: 40,
    backgroundColor: '#d8d8d8',
  },
  faded: {
    opacity: 0.25,
  },
  topPhotos: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: -3.3,
  },
  bottomPhotos: {
    marginTop: -3.3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default connect((state) => state.main)(GroupPhoto);
