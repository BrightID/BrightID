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
  avatarUri: string,
};

class NearbyAvatar extends React.Component<Props> {
  render() {
    // let { avatarUri } = this.props;
    return (
      <View style={styles.container}>
        <Image
          source={require('../static/ronaldjones.png')}
          style={styles.avatar}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 11,
    marginBottom: 9,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 4,
  },
});

export default connect(null)(NearbyAvatar);
