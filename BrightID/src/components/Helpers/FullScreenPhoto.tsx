import React, { useRef } from 'react';
import { Animated, StyleSheet, PanResponder } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { photoDirectory } from '@/utils/filesystem';
import { BLACK } from '@/theme/colors';

type props = NativeStackScreenProps<ModalStackParamList, 'FullScreenPhoto'>;

const FullScreenPhoto = ({ route, navigation }: props) => {
  const photo = route.params?.photo;
  const base64 = route.params?.base64;
  const uri = base64 ? photo : `file://${photoDirectory()}/${photo?.filename}`;

  const imageSource =
    photo?.filename || base64
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
