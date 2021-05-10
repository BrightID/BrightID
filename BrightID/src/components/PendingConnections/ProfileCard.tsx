import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK, RED } from '@/theme/colors';
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
  userReported?: { id: string; reportReason: string };
};

export const ProfileCard = (props: ProfileCardProps) => {
  const {
    verified,
    name,
    photoTouchHandler,
    photo,
    photoType,
    photoSize,
    reported,
    userReported,
  } = props;

  const { t } = useTranslation();
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
        {userReported && (
          <Text style={styles.reported}>
            ({t('common.tag.reportedByUser')}
            {userReported.reportReason &&
              userReported.reportReason !== 'other' &&
              t('common.tag.reportReason', {
                reportReason: userReported.reportReason,
              })}
            )
          </Text>
        )}
        {reported && (
          <Text style={styles.reported}>{t('common.tag.reported')}</Text>
        )}
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
  },
  connectName: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
    letterSpacing: 0,
    textAlign: 'left',
    color: BLACK,
  },
  reported: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
    color: RED,
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
