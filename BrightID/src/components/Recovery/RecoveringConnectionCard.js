// @flow

import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { photoDirectory } from '@/utils/filesystem';
import ChannelAPI from '@/api/channelService';
import api from '@/api/brightId';
import { loadRecoveryData, uploadSig, uploadMutualInfo } from './helpers';

const RecoveryConnectionCard = (props) => {
  const { id, aesKey, photo, name, connectionDate, style } = props;

  const [imgErr, setImgErr] = useState(false);

  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleConnectionSelect = async () => {
    try {
      const ipAddress = await api.ip();
      const channelApi = new ChannelAPI(`http://${ipAddress}/profile`);
      const { signingKey, timestamp } = await loadRecoveryData(
        channelApi,
        aesKey,
      );
      await uploadSig({ id, timestamp, signingKey, channelApi, aesKey });
      uploadMutualInfo(props, channelApi, aesKey).then(() => {
        Alert.alert(
          t('common.alert.info'),
          t('restore.alert.text.requestRecovering'),
          [
            {
              text: t('common.alert.ok'),
              onPress: () => navigation.navigate('Home'),
            },
          ],
        );
      });
    } catch (err) {
      console.warn(err.message);
    }
  };

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  return (
    <TouchableOpacity onPress={handleConnectionSelect}>
      <View style={{ ...styles.container, ...style }}>
        <Image
          source={imageSource}
          style={styles.photo}
          onError={() => {
            setImgErr(true);
          }}
          accessibilityLabel="profile picture"
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.scoreContainer}></View>
          <Text style={styles.connectedText}>
            {t('common.tag.connectionDate', {
              date: moment(parseInt(connectionDate, 10)).fromNow(),
            })}
          </Text>
        </View>
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
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photo: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default RecoveryConnectionCard;
