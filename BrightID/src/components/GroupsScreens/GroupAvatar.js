// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { groupPhotos } from '../../utils/groups';

/**
 * Avatar Picture displayed on the HomeScreen
 * The Image is sourced from the main reducer as avatar
 * @prop avatar a raw image string
 * TODO store the image locally using asyncStorage
 * or any local db easy to use with React-native
 */

class GroupAvatar extends React.Component<Props> {
  state = {
    groupPhotos: [],
  };

  componentDidMount() {
    this.updatePhoto();
  }

  updatePhoto() {
    this.setState({ groupPhotos: groupPhotos(this.props.group)});
  }

  render() {
    const { groupPhotos } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.topAvatars}>
          {groupPhotos[0] && (
            <Image
              source={groupPhotos[0].avatar}
              style={[styles.avatar, groupPhotos[0].faded ? styles.faded : '']}
            />
          )}
        </View>
        <View style={styles.bottomAvatars}>
          {groupPhotos[1] && (
            <Image
              source={groupPhotos[1].avatar}
              style={[styles.avatar, groupPhotos[1].faded ? styles.faded : '']}
            />
          )}
          {groupPhotos[2] && (
            <Image
              source={groupPhotos[2].avatar}
              style={[styles.avatar, groupPhotos[2].faded ? styles.faded : '']}
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
