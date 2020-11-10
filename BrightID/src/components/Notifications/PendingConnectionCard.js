// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import CirclePhoto from '@/components/Helpers/CirclePhoto';

export const PendingConnectionCard = ({ pendingConnections }) => {
  const { navigate } = useNavigation();
  const { t } = useTranslation();
  const circlePhotos = pendingConnections.map(({ photo }) => ({ uri: photo }));
  const firstNames = pendingConnections
    .map(({ name }) => name.split(' ')[0])
    .join(', ');
  const navToPending = () => {
    navigate('PendingConnections');
  };
  return (
    <TouchableOpacity style={styles.container} onPress={navToPending}>
      <View style={styles.photoContainer}>
        {circlePhotos.length > 1 ? (
          <CirclePhoto circlePhotos={circlePhotos} />
        ) : (
          <Image
            source={circlePhotos[0]}
            style={styles.photo}
            resizeMode="cover"
            onError={(e) => {
              console.log(e);
            }}
            accessible={true}
            accessibilityLabel={t('common.accessibilityLabel.userPhoto')}
          />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {firstNames}
        </Text>
        <Text
          style={styles.invitationMsg}
          adjustsFontSizeToFit={true}
          numberOfLines={1}
        >
          {t('notifications.item.text.pendingConnections', {count: pendingConnections.length})}
        </Text>
      </View>
      <View style={styles.approvalButtonContainer} />
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
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#B64B32',
  },
  greenCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5DEC9A',
  },
  greyCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#707070',
    marginLeft: 7,
    marginRight: 7,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // minWidth: 100,
  },
});

export default PendingConnectionCard;
