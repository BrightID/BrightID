import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, DARK_ORANGE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

export const ConnectionStatus = ({
  index,
  status,
  hiddenFlag,
  connectionDate,
  level,
}) => {
  const { t } = useTranslation();
  if (status === 'initiated') {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.waitingMessage}>
          {t('connections.tag.waiting')}
        </Text>
      </View>
    );
  } else if (status === 'stale') {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.waitingMessage}>{t('connections.tag.failed')}</Text>
      </View>
    );
  } else if (status === 'hidden') {
    return (
      <View style={styles.statusContainer}>
        <Text style={[styles.deletedMessage, { marginTop: 1 }]}>
          {hiddenFlag
            ? t('connections.tag.reportedAs', {
                flag: `Reported as ${hiddenFlag}`,
              })
            : t('connections.tag.hidden')}
        </Text>
        <Text style={[styles.connectedText, { marginTop: 1 }]}>
          {t('common.tag.connectionDate', {
            date: moment(parseInt(connectionDate, 10)).fromNow(),
          })}
        </Text>
      </View>
    );
  } else if (status === 'deleted') {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.deletedMessage}>
          {t('connections.tag.deleted')}
        </Text>
      </View>
    );
  } else {
    return (
      <View style={styles.statusContainer} testID={`connection-${index}`}>
        <Text
          testID={`connection_level-${index}`}
          style={[
            styles.connectionLevel,
            { color: connectionLevelColors[level] },
          ]}
        >
          {connectionLevelStrings[level]}
        </Text>
        <Text style={styles.connectionTime} testID={`connection_time-${index}`}>
          {t('common.tag.connectionDate', {
            date: moment(parseInt(connectionDate, 10)).fromNow(),
          })}
        </Text>
      </View>
    );
  }
};

// TODO: missing connectedText
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: DEVICE_LARGE ? 102 : 92,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  card: {
    width: '90%',
    height: DEVICE_LARGE ? 76 : 71,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: DEVICE_LARGE ? 12 : 10,
    borderBottomLeftRadius: DEVICE_LARGE ? 12 : 10,
  },
  photo: {
    borderRadius: 55,
    width: DEVICE_LARGE ? 65 : 55,
    height: DEVICE_LARGE ? 65 : 55,
    marginLeft: DEVICE_LARGE ? 14 : 12,
    marginTop: -30,
  },
  info: {
    marginLeft: DEVICE_LARGE ? 22 : 19,
    flex: 1,
    height: DEVICE_LARGE ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  statusContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  connectionLevel: {
    fontFamily: 'Poppins-Regular',
    fontSize: DEVICE_LARGE ? 12 : 11,
    marginTop: DEVICE_LARGE ? 3 : 1,
  },
  connectionTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: DEVICE_LARGE ? 10 : 9,
    color: DARK_ORANGE,
  },
  moreIcon: {
    marginRight: DEVICE_LARGE ? 26 : 23,
  },
  waitingMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 13 : 11,
    color: '#e39f2f',
    marginTop: DEVICE_LARGE ? 2 : 0,
  },
  deletedMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#FF0800',
    marginTop: DEVICE_LARGE ? 5 : 2,
    textTransform: 'capitalize',
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 5 : 3.5,
  },
  removeButton: {
    width: DEVICE_LARGE ? 36 : 32,
    position: 'absolute',
    right: 0,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: fontSize[12],
    color: GREY,
    fontStyle: 'italic',
  },
});
