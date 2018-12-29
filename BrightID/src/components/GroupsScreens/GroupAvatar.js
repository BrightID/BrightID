// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import { NavigationEvents } from 'react-navigation';
import { groupCirclePhotos } from '../../utils/groups';

/**
 * Avatar Picture displayed on the HomeScreen
 * The Image is sourced from the main reducer as avatar
 * @prop avatar is a filename - avatars located in ~/documents/avatar
 */

class GroupAvatar extends React.Component {

  render() {
    const circlePhotos = groupCirclePhotos(this.props.group);

    return (
      <View style={styles.container}>
        <View style={styles.topAvatars}>
          {circlePhotos[0] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  circlePhotos[0].avatar.filename
                }`,
              }}
              style={[styles.avatar, circlePhotos[0].faded ? styles.faded : '']}
            />
          )}
        </View>
        <View style={styles.bottomAvatars}>
          {circlePhotos[1] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  circlePhotos[1].avatar.filename
                }`,
              }}
              style={[styles.avatar, circlePhotos[1].faded ? styles.faded : '']}
            />
          )}
          {circlePhotos[2] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  circlePhotos[2].avatar.filename
                }`,
              }}
              style={[styles.avatar, circlePhotos[2].faded ? styles.faded : '']}
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
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    backgroundColor: '#d8d8d8',
  },
  faded: {
    opacity: 0.25,
  },
  topAvatars: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: -3.3,
  },
  bottomAvatars: {
    marginTop: -3.3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default connect((state) => state.main)(GroupAvatar);
