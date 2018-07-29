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

class EligibleGroupAvatar extends React.Component<Props> {
  render() {
    const { userAvatar } = this.props;
    const Avatar = userAvatar ? (
      <Image source={userAvatar} style={styles.avatar} />
    ) : (
      <View style={styles.avatar} />
    );
    return <View style={styles.container}>{Avatar}</View>;
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
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
    backgroundColor: '#d8d8d8',
  },
});

export default connect((state) => state.main)(EligibleGroupAvatar);
