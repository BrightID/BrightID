// @flow

import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';

/**
 * Avatar Picture displayed on the HomeScreen
 * The Image is sourced from the main reducer as userAvatar
 * @prop userAvatar a raw image string
 * TODO store the image locally using asyncStorage
 * or any local db easy to use with React-native
 */

type Props = {
  userAvatar: string,
  names: [string],
};

class EligibleGroupAvatar extends React.Component<Props> {
  render() {
    const { userAvatar, names } = this.props;
    const faded = names.includes('Anna');
    return (
      <View style={styles.container}>
        <View style={styles.topAvatars}>
          <Image
            source={userAvatar || require('../../static/default_avatar.jpg')}
            style={[styles.avatar]}
          />
        </View>
        <View style={styles.bottomAvatars}>
          <Image
            source={userAvatar || require('../../static/default_avatar.jpg')}
            style={[styles.avatar, faded ? styles.faded : '']}
          />

          <Image
            source={userAvatar || require('../../static/default_avatar.jpg')}
            style={[styles.avatar, faded ? styles.faded : '']}
          />
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

export default connect((state) => state.main)(EligibleGroupAvatar);
