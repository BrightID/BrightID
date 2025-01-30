import React, { useRef } from 'react';
import { Animated, StyleSheet, PanResponder } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { StackScreenProps } from '@react-navigation/stack';
import { photoDirectory } from '@/utils/filesystem';
import { BLACK } from '@/theme/colors';
import { RootStackParamList } from '@/routes/navigationTypes';

type props = StackScreenProps<RootStackParamList, 'FullScreenPhoto'>;

const FullScreenPhoto = ({ route, navigation }: props) => {
  const photo = route.params?.photo;
  const base64 = route.params?.base64;

  // TODO photo is currently either a plain string or an object with a filename property. This needs to
  // be cleaned up
  const uri = base64
    ? photo
    : `file://${photoDirectory()}/${(photo as Photo).filename}`;

  const imageSource =
    (photo as Photo).filename || base64
      ? {
          uri,
        }
      : require('@/static/default_profile.jpg');

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        navigation.goBack();
      },
    }),
  ).current;

  return (
    <BlurView
      style={[styles.container]}
      blurType="dark"
      blurAmount={10}
      reducedTransparencyFallbackColor={BLACK}
    >
      <Animated.Image
        source={imageSource}
        style={[
          styles.photo,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        resizeMethod="scale"
        resizeMode="contain"
        {...panResponder.panHandlers}
      />
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  photo: {
    width: '100%',
    flex: 1,
  },
});

export default FullScreenPhoto;
