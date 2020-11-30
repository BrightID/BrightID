// @flow

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { CHANNEL_TTL } from '@/utils/constants';
import { photoDirectory } from '@/utils/filesystem';
import { staleConnection, deleteConnection } from '@/actions';
import verificationSticker from '@/static/verification-sticker.svg';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';

import {
  connectionLevelColors,
  connectionLevelStrings,
} from '../../utils/connectionLevelStrings';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop connectionTime
 * @prop photo
 */

const ConnectionCard = (props) => {
  let stale_check_timer = useRef(0);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    status,
    verifications,
    connectionDate,
    id,
    name,
    photo,
    hiddenFlag,
    index,
    level,
  } = props;
  const { t } = useTranslation();

  const brightidVerified = verifications?.includes('BrightID');
  const [imgErr, setImgErr] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // if we have a "waiting" connection, start timer to handle stale connection requests
      if (status === 'initiated') {
        const checkStale = () => {
          const ageMs = Date.now() - connectionDate;
          if (ageMs > CHANNEL_TTL && status !== 'verified') {
            console.log(`Connection ${name} is stale (age: ${ageMs} ms)`);
            return true;
          }
          return false;
        };
        if (checkStale()) {
          // this is already old. Immediately mark as "stale", no need for a timer.
          dispatch(staleConnection(id));
        } else {
          // start timer to check if connection got verified after maximum channel lifetime
          let checkTime = connectionDate + CHANNEL_TTL + 5000 - Date.now(); // add 5 seconds buffer
          if (checkTime < 0) {
            console.log(`Warning - checkTime in past: ${checkTime}`);
            checkTime = 1000; // check in 1 second
          }
          console.log(`Marking connection as stale in ${checkTime}ms.`);
          clearTimeout(stale_check_timer.current);
          stale_check_timer.current = setTimeout(() => {
            if (checkStale()) {
              dispatch(staleConnection(id));
            }
          }, checkTime);
        }
      }
      return () => {
        // clear timer if it is set
        if (stale_check_timer.current) {
          clearTimeout(stale_check_timer.current);
          stale_check_timer.current = 0;
        }
      };
    }, [connectionDate, dispatch, id, name, status]),
  );

  useEffect(() => {
    if (stale_check_timer.current && status === 'verified') {
      console.log(
        `Connection ${name} changed 'initiated' -> 'verified'. Stopping stale_check_timer ID ${stale_check_timer.current}.`,
      );
      clearTimeout(stale_check_timer.current);
      stale_check_timer.current = 0;
    }
  }, [name, status]);

  const ConnectionStatus = () => {
    if (status === 'initiated') {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.waitingMessage}>Waiting</Text>
        </View>
      );
    } else if (status === 'stale') {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.waitingMessage}>
            {`Connection failed.\nPlease try again.`}
          </Text>
        </View>
      );
    } else if (status === 'hidden') {
      return (
        <View style={styles.statusContainer}>
          <Text style={[styles.deletedMessage, { marginTop: 1 }]}>
            {hiddenFlag ? `Reported as ${hiddenFlag}` : 'Hidden'}
          </Text>
          <Text style={[styles.connectedText, { marginTop: 1 }]}>
            {t('common.tag.connectionDate', {date: moment(parseInt(connectionDate, 10)).fromNow()})}
          </Text>
        </View>
      );
    } else if (status === 'deleted') {
      return (
        <View style={styles.statusContainer}>
          <Text style={styles.deletedMessage}>Deleted</Text>
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
          <Text
            style={styles.connectionTime}
            testID={`connection_time-${index}`}
          >
            {t('common.tag.connectionDate', {date: moment(parseInt(connectionDate, 10)).fromNow()})}
          </Text>
        </View>
      );
    }
  };

  const { showActionSheetWithOptions } = useActionSheet();
  const removeOptions = [t('connections.removeActionSheet.remove'), t('common.actionSheet.cancel')];

  const showRemove = status === 'deleted' || status === 'stale';

  const RemoveConnection = () =>
    showRemove ? (
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => {
          showActionSheetWithOptions(
            {
              options: removeOptions,
              cancelButtonIndex: removeOptions.length - 1,
              destructiveButtonIndex: 0,
              title: t('connections.removeActionSheet.title'),
              message: t('connections.removeActionSheet.info', {name: name}),
              showSeparators: true,
              textStyle: {
                textAlign: 'center',
                width: '100%',
              },
            },
            (index) => {
              if (index === 0) dispatch(deleteConnection(id));
            },
          );
        }}
      >
        <Material color="#333" name="close" size={DEVICE_LARGE ? 22 : 18} />
      </TouchableOpacity>
    ) : (
      <View />
    );

  const imageSource =
    photo?.filename && !imgErr
      ? {
          uri: `file://${photoDirectory()}/${photo?.filename}`,
        }
      : require('@/static/default_profile.jpg');

  return (
    <View style={styles.container} testID="connectionCardContainer">
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('FullScreenPhoto', { photo });
          }}
          accessibilityLabel="View Photo Full Screen"
          accessibilityRole="imagebutton"
        >
          <Image
            source={imageSource}
            style={styles.photo}
            accessibilityLabel="ConnectionPhoto"
            onError={() => {
              console.log('settingImgErr');
              setImgErr(true);
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID={`ConnectionCard-${index}`}
          onPress={() => {
            navigation.navigate('Connection', { connectionId: id });
          }}
          accessibilityLabel="View Connection details"
        >
          <View style={[styles.info, { maxWidth: WIDTH * 0.56 }]}>
            <View
              style={[styles.nameContainer]}
              testID={`connection_name-${index}`}
            >
              <Text
                // adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={styles.name}
                testID={`connectionCardText-${index}`}
              >
                {name}
              </Text>
              {brightidVerified && (
                <SvgXml
                  style={styles.verificationSticker}
                  width="16"
                  height="16"
                  xml={verificationSticker}
                />
              )}
            </View>
            <ConnectionStatus />
          </View>
        </TouchableOpacity>
        <RemoveConnection />
      </View>
    </View>
  );
};

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
    color: '#B64B32',
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
});

export default ConnectionCard;
