// @flow

import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Spinner from 'react-native-spinkit';

export const LoadingScreen = () => (
  <View style={styles.container}>
    <Spinner
      isVisible={true}
      size={47}
      type="FadingCircleAlt"
      color="#4990e2"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
