import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { photoDirectory } from '@/utils/filesystem';
import { groupCirclePhotos } from '@/utils/groups';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { LIGHT_GREY } from '@/theme/colors';

const photoStyle = (photo: { faded: boolean }, large: boolean) => {
  return [
    styles.photo,
    { opacity: photo.faded ? 0.25 : 1 },
    large ? styles.smallLarge : styles.smallNormal,
  ];
};

const GroupPhoto = ({ group, large = false }) => {
  const navigation = useNavigation();
  if (group.photo?.filename) {
    return (
      <View style={styles.container}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.navigate('FullScreenPhoto', { photo: group.photo });
          }}
        >
          <Image
            source={{
              uri: `file://${photoDirectory()}/${group.photo.filename}`,
            }}
            style={[styles.bigPhoto, large ? styles.large : styles.normal]}
          />
        </TouchableWithoutFeedback>
      </View>
    );
  } else {
    const circlePhotos = groupCirclePhotos(group).map((item) => {
      if (item.photo?.filename) {
        item.source = {
          uri: `file://${photoDirectory()}/${item.photo?.filename}`,
        };
      } else {
        item.source = require('@/static/default_profile.jpg');
      }
      return item;
    });

    return (
      <View style={styles.container}>
        <View style={styles.topPhotos}>
          {circlePhotos[0] && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate('FullScreenPhoto', {
                  photo: circlePhotos[0].photo,
                });
              }}
            >
              <Image
                source={circlePhotos[0].source}
                style={photoStyle(circlePhotos[0], large)}
              />
            </TouchableWithoutFeedback>
          )}
        </View>
        <View style={styles.bottomPhotos}>
          {circlePhotos[1] && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate('FullScreenPhoto', {
                  photo: circlePhotos[1].photo,
                });
              }}
            >
              <Image
                source={circlePhotos[1].source}
                style={photoStyle(circlePhotos[1], large)}
              />
            </TouchableWithoutFeedback>
          )}
          {circlePhotos[2] && (
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate('FullScreenPhoto', {
                  photo: circlePhotos[2].photo,
                });
              }}
            >
              <Image
                source={circlePhotos[2].source}
                style={photoStyle(circlePhotos[2], large)}
              />
            </TouchableWithoutFeedback>
          )}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  bigPhoto: {
    backgroundColor: LIGHT_GREY,
  },
  normal: {
    borderRadius: 30,
    width: DEVICE_LARGE ? 60 : 54,
    height: DEVICE_LARGE ? 60 : 54,
  },
  large: {
    borderRadius: 40,
    width: DEVICE_LARGE ? 80 : 73,
    height: DEVICE_LARGE ? 80 : 73,
  },
  photo: {
    backgroundColor: LIGHT_GREY,
  },
  smallNormal: {
    borderRadius: 20,
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
  },
  smallLarge: {
    borderRadius: 23,
    width: DEVICE_LARGE ? 46 : 38,
    height: DEVICE_LARGE ? 46 : 38,
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

export default connect()(GroupPhoto);
