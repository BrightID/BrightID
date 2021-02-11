import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { LIGHT_GREY } from '@/theme/colors';

const photoStyle = (photo) => ({
  ...styles.photo,
  opacity: photo.faded ? 0.25 : 1,
});

const CirclePhoto = ({ circlePhotos }) => {
  console.log(circlePhotos);
  return (
    <View style={styles.container}>
      <View style={styles.topPhotos}>
        {circlePhotos[0] && (
          <Image source={circlePhotos[0]} style={photoStyle(circlePhotos[0])} />
        )}
      </View>
      <View style={styles.bottomPhotos}>
        {circlePhotos[1] && (
          <Image source={circlePhotos[1]} style={photoStyle(circlePhotos[1])} />
        )}
        {circlePhotos[2] && (
          <Image source={circlePhotos[2]} style={photoStyle(circlePhotos[2])} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  bigPhoto: {
    borderRadius: 30,
    width: 60,
    height: 60,
    backgroundColor: LIGHT_GREY,
  },
  photo: {
    borderRadius: 20,
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    backgroundColor: LIGHT_GREY,
  },
  faded: {
    opacity: 0.25,
  },
  topPhotos: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: -3.3,
  },
  bottomPhotos: {
    marginTop: -3.3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default CirclePhoto;