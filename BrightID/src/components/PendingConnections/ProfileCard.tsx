import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { photoDirectory } from '@/utils/filesystem';

/*
Displays profile photo, name and verified status
 */
type ProfileCardProps = {
  photo: string;
  photoType: 'base64' | 'file';
  photoTouchHandler: (photo: string, type: 'base64' | 'file') => any;
  name: string;
  verified: boolean;
  photoSize: 'small' | 'large';
  reported?: boolean;
};

export const ProfileCard = (props: ProfileCardProps) => {
  const {
    verified,
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
        {verified && (
          <View style={styles.verificationSticker}>
            <VerifiedBadge width={16} height={16} />
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
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[17],
    color: BLACK,
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
    marginLeft: DEVICE_LARGE ? 7 : 5,
  },
});
