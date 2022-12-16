import React from 'react';
import { View, StyleSheet } from 'react-native';
import Spinner from 'react-native-spinkit';
import { ORANGE } from '@/theme/colors';

export const InitialLoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Spinner
        isVisible={true}
        size={47}
        type="FadingCircleAlt"
        color={ORANGE}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialLoadingScreen;
