// @flow

import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { photoDirectory } from '@/utils/filesystem';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

/**
 * Notification Card in the Notifications Screen
 * each Notification should have:
 * @prop msg
 * @prop icon
 */

const NotificationCard = (props) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const imageSource = photoFilename
    ? {
        uri: `file://${photoDirectory()}/${photoFilename}`,
      }
    : require('@/static/default_profile.jpg');

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate('TrustedConnections');
      }}
    >
      <View style={styles.photoContainer}>
        <Image
          source={imageSource}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel={t('common.accessibilityLabel.userPhoto')}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{t('notifications.item.title.backupBrightId')}</Text>
        <Text style={styles.invitationMsg}>
          {t('notifications.item.text.backupBrightId')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    borderBottomColor: '#e3e0e4',
    borderBottomWidth: 1,
    paddingBottom: DEVICE_LARGE ? 10 : 8,
    paddingTop: DEVICE_LARGE ? 10 : 8,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: DEVICE_LARGE ? 85 : 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    borderRadius: 100,
    width: DEVICE_LARGE ? 60 : 48,
    height: DEVICE_LARGE ? 60 : 48,
    backgroundColor: '#d8d8d8',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 10 : 7,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 71 : 65,
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#B64B32',
  },
});

export default NotificationCard;
