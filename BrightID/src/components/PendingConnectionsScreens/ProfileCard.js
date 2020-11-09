// @flow

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { photoDirectory } from '@/utils/filesystem';

/*
Displays profile photo, name and verified status
 */
type ProfileCardProps = {
  photo: string,
  photoType: 'base64' | 'file',
  photoTouchHandler: (photo: string, type: 'base64' | 'file') => any,
  name: string,
  brightIdVerified: boolean,
  photoSize: 'small' | 'large',
};

export const ProfileCard = (props: ProfileCardProps) => {
  const {
    brightIdVerified,
    name,
    photoTouchHandler,
    photo,
    photoType,
    photoSize,
  } = props;

  // build photo uri depending on type
  const photoUri =
    photoType === 'base64' ? photo : `file://${photoDirectory()}/${photo}`;

  return (
    <>
      <TouchableWithoutFeedback
        onPress={() => photoTouchHandler(photo, photoType)}
      >
        <Image
          source={{ uri: photoUri }}
          style={styles[`photo_${photoSize}`]}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="user photo"
        />
      </TouchableWithoutFeedback>
      <View style={styles.connectNameContainer}>
        <Text style={styles.connectName}>{name}</Text>
        {brightIdVerified && (
          <View style={styles.verificationSticker}>
            <SvgXml width="16" height="16" xml={verificationSticker} />
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  connectNameContainer: {
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  connectName: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 17 : 14,
    color: '#000000',
  },
  photo_small: {
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  photo_large: {
    borderRadius: 75,
    width: 150,
    height: 150,
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 8 : 5,
  },
});
