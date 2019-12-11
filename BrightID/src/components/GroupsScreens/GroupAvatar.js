// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import { groupPhotos } from '../../utils/groups';

/**
 * Avatar Picture displayed on the HomeScreen
 * The Image is sourced from the main reducer as avatar
 * @prop avatar is a filename - avatars located in ~/documents/avatar
 */

class GroupAvatar extends React.Component<Props> {
  state = {
    avatars: [],
  };

  componentDidMount() {
    this.updatePhoto();
  }

  updatePhoto() {
    const avatars = groupPhotos(this.props.group);
    this.setState({ avatars });
  }

  render() {
    const { avatars } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.topAvatars}>
          {avatars[0] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  avatars[0].avatar.filename
                }`,
              }}
              style={[styles.avatar, avatars[0].faded ? styles.faded : '']}
            />
          )}
        </View>
        <View style={styles.bottomAvatars}>
          {avatars[1] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  avatars[1].avatar.filename
                }`,
              }}
              style={[styles.avatar, avatars[1].faded ? styles.faded : '']}
            />
          )}
          {avatars[2] && (
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/avatars/${
                  avatars[2].avatar.filename
                }`,
              }}
              style={[styles.avatar, avatars[2].faded ? styles.faded : '']}
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

export default connect((state) => state)(GroupAvatar);
