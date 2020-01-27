// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import { groupCirclePhotos } from '../../utils/groups';

class GroupPhoto extends React.Component {

  photoStyle(photo) {
    const { radius = 20 } = this.props;
    const style = { ...styles.photo };
    if (photo.faded) {
      style.opacity = 0.25;
    }
    return {
      ...style,
      borderRadius: radius,
      width: radius * 2,
      height: radius * 2,
    };
  }

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
              style={this.photoStyle(circlePhotos[0])}
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
              style={this.photoStyle(circlePhotos[1])}
            />
          )}
          {circlePhotos[2] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${
                  circlePhotos[2].photo.filename
                  }`,
              }}
              style={this.photoStyle(circlePhotos[2])}
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

export default connect((state) => state)(GroupPhoto);
