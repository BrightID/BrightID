// @flow

import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  Easing,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
/**
 * Search Bar in the Groups Screen
 *
 * TODO: Create a shared search component to use in both Connections and Group view
 */

const X_TRANSFORM = DEVICE_LARGE ? 45 : 40;
const ANIMATION_DURATION = 150;

const ChannelSwitch = ({ value, onValueChange }) => {
  // const dispatch = useDispatch();

  const toggleAnim = useRef(new Animated.Value(value ? 0 : X_TRANSFORM))
    .current;
  const backgroundAnim = useRef(new Animated.Value(value ? 0 : X_TRANSFORM))
    .current;

  const getPidded = () => {
    Animated.parallel([
      Animated.timing(toggleAnim, {
        toValue: value ? X_TRANSFORM : 0,
        useNativeDriver: true,
        duration: ANIMATION_DURATION,
        // ease out
        easing: Easing.bezier(0.39, -0.01, 1, 1),
      }),
      Animated.timing(backgroundAnim, {
        toValue: value ? X_TRANSFORM : 0,
        useNativeDriver: false,
        duration: ANIMATION_DURATION,
        // ease out
        easing: Easing.bezier(0.39, -0.01, 1, 1),
      }),
    ]).start(({ finished }) => {
      if (finished) onValueChange();
    });
  };

  console.log('rendering channel switch');

  return (
    <TouchableWithoutFeedback onPress={getPidded}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: backgroundAnim.interpolate({
              inputRange: [0, X_TRANSFORM],
              outputRange: ['grey', ORANGE],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.toggle,
            {
              transform: [
                {
                  translateX: toggleAnim,
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.leftIcon,
            {
              opacity: 1,
            },
          ]}
        >
          <Material
            name="account-multiple"
            size={DEVICE_LARGE ? 22 : 18}
            color="#fff"
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.rightIcon,
            {
              opacity: 1,
            },
          ]}
        >
          <Material name="account" size={DEVICE_LARGE ? 22 : 18} color="#fff" />
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: DEVICE_LARGE ? 80 : 70,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: DEVICE_LARGE ? 5 : 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderColor: '#aaa',
    // borderWidth: 2,
  },
  toggle: {
    position: 'absolute',
    left: 1,
    width: DEVICE_LARGE ? 33 : 28,
    height: '95%',
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 2,
    borderRadius: 3,
  },
  leftIcon: {
    position: 'absolute',
    left: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightIcon: {
    position: 'absolute',
    right: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChannelSwitch;
