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
};

class UserAvatar extends React.Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <Image source={{ uri: this.props.userAvatar }} style={styles.avatar} />
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
    width: 142,
    height: 142,
    borderRadius: 71,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
});

export default connect(state => state.main)(UserAvatar);
