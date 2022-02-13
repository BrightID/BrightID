import * as React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { photoDirectory } from '@/utils/filesystem';
import { groupCirclePhotos } from '@/utils/groups';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { LIGHT_GREY } from '@/theme/colors';

type GroupPhotoProps = {
  group: Group;
};

export const GroupPhoto = ({ group }: GroupPhotoProps) => {
  if (group.photo?.filename) {
    return (
      <View style={styles.container}>
        <Image
          source={{
            uri: `file://${photoDirectory()}/${group.photo.filename}`,
          }}
          style={styles.bigPhoto}
        />
      </View>
    );
  } else {
    const circlePhotos = groupCirclePhotos(group).map(
      (item: { photo: Photo; source: any }) => {
        if (item.photo?.filename) {
          item.source = {
            uri: `file://${photoDirectory()}/${item.photo?.filename}`,
          };
        } else {
          item.source = require('@/static/default_profile.jpg');
        }
        return item;
      },
    );
    return (
      <View style={styles.container}>
        <View style={styles.topPhotos}>
          {circlePhotos[0] && (
            <Image source={circlePhotos[0].source} style={styles.photo} />
          )}
        </View>
        <View style={styles.bottomPhotos}>
          {circlePhotos[1] && (
            <Image source={circlePhotos[1].source} style={styles.photo} />
          )}
          {circlePhotos[2] && (
            <Image source={circlePhotos[2].source} style={styles.photo} />
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
