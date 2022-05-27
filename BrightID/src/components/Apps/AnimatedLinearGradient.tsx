import React from 'react';
import { StyleSheet, Text, View, Animated, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type AnimatedLinearGradientProps = {
  children?: React.ReactNode;
  containerStyle?: any;
  style?: any;
  colors: string[];
};

export default function AnimatedLinearGradient(
  props: AnimatedLinearGradientProps,
) {
  return (
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  linearGradient: {
    flex: 1,
  },
});
