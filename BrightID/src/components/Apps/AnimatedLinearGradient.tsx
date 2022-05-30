import React from 'react';
import { StyleSheet, Animated } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';

type AnimatedLinearGradientProps = {
  children?: React.ReactNode;
  containerStyle?: any;
  style?: any;
  colors: string[];
};

export default function AnimatedLinearGradient(
  props: AnimatedLinearGradientProps,
) {
  const noGradient = (
    <Animated.View style={[styles.simple, props.containerStyle]}>
      <Animated.View
        style={StyleSheet.flatten([styles.linearGradient, props.style])}
      >
        {props.children}
      </Animated.View>
    </Animated.View>
  );

  /*
  const gradient = (
    <Animated.View
      style={StyleSheet.flatten([styles.container, props.containerStyle])}
    >
      <LinearGradient
        colors={props.colors}
        style={StyleSheet.flatten([styles.linearGradient, props.style])}
      >
        {props.children}
      </LinearGradient>
    </Animated.View>
  );

   */

  return noGradient;
}

const styles = StyleSheet.create({
  simple: {
    backgroundColor: '#3E4481',
  },
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
});
