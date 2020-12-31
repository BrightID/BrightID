// @flow

import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { photoDirectory } from '@/utils/filesystem';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { addTrustedConnection, removeTrustedConnection } from '@/actions/index';
import { DEVICE_TYPE } from '@/utils/deviceConstants';
import { DARK_GREY, GREEN, BLACK, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

const TrustedConnectionCard = (props) => {
  const { id, photo, name, connectionDate, style } = props;

  const [imgErr, setImgErr] = useState(false);

  const trustedConnections = useSelector(
    (state) => state.connections.trustedConnections,
  );

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const toggleConnectionSelect = () => {
    trustedConnections.includes(id)
      ? dispatch(removeTrustedConnection(id))
      : dispatch(addTrustedConnection(id));
  };

  const selected = () => trustedConnections.includes(id);

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  return (
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
        <Text style={styles.connectedText}>
          {t('common.tag.connectionDate', {
            date: moment(parseInt(connectionDate, 10)).fromNow(),
          })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.moreIcon}
        onPress={toggleConnectionSelect}
      >
        <AntDesign
          size={30.4}
          name={selected() ? 'checkcircle' : 'checkcircleo'}
          color={selected() ? GREEN : BLACK}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: WHITE,
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
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
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[20],
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: DARK_GREY,
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default TrustedConnectionCard;
