// @flow

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { DEVICE_LARGE, MAX_WAITING_SECONDS } from '@/utils/constants';
import { photoDirectory } from '@/utils/filesystem';
import { staleConnection } from '@/actions';

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
  const [verified, setVerified] = useState(false);
  const { status, connectionDate, id, name, photo, hiddenFlag, index } = props;
  const [imgErr, setImgErr] = useState(false);

  useFocusEffect(
    useCallback(() => {
      // if we have a "waiting" connection, start timer to handle stale connection requests
      if (status === 'initiated') {
        const checkStale = () => {
          const ageSeconds = Math.floor((Date.now() - connectionDate) / 1000);
          if (ageSeconds > MAX_WAITING_SECONDS && status !== 'verified') {
            console.log(
              `Connection ${name} is stale (age: ${ageSeconds} seconds)`,
            );
            return true;
          }
          return false;
        };
        if (checkStale()) {
          // this is already old. Immediately mark as "stale", no need for a timer.
          dispatch(staleConnection(id));
        } else {
          // start timer to check if connection got verified after MAX_WAITING_TIME
          let checkTime =
            connectionDate + MAX_WAITING_SECONDS * 1000 + 5000 - Date.now(); // add 5 seconds buffer
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

  useEffect(() => {
    if (verifications) {
      setVerified(verifications.includes('BrightID'));
    }
  }, [verifications]);

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
            {hiddenFlag ? `Flagged as ${hiddenFlag}` : 'Hidden'}
          </Text>
          <Text style={[styles.connectedText, { marginTop: 1 }]}>
            Connected {moment(parseInt(connectionDate, 10)).fromNow()}
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
      const testID = `connection-${index}`;
      const stickerTestID = `${testID}-verified`;
      return (
        <View style={styles.statusContainer}>
          {verified && (
            <Text testID={stickerTestID} style={styles.verified}>
              verified
            </Text>
          )}
          <Text style={styles.connectedText} testID={testID}>
            Connected {moment(parseInt(connectionDate, 10)).fromNow()}
          </Text>
        </View>
      );
    }
  };

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
        <View style={styles.info}>
          <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={styles.name}
            testID="connectionCardText"
          >
            {name}
          </Text>
          <ConnectionStatus />
        </View>
      </View>
    </View>
  );
};

const ORANGE = '#ED7A5D';
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
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  connectedText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 11 : 10,
    color: '#B64B32',
    marginTop: DEVICE_LARGE ? 5 : 2,
  },
  moreIcon: {
    marginRight: DEVICE_LARGE ? 26 : 23,
  },
  waitingMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#e39f2f',
    marginTop: DEVICE_LARGE ? 2 : 0,
  },
  deletedMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#FF0800',
    marginTop: DEVICE_LARGE ? 5 : 2,
    textTransform: 'capitalize',
  },
  verified: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    color: ORANGE,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
    marginTop: 6,
    marginRight: 8,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 10,
    paddingRight: 7,
    fontSize: DEVICE_LARGE ? 9 : 7,
  },
});

export default ConnectionCard;
