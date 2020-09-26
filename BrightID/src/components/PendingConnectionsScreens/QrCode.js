// @flow

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/constants';
import { qrCodeToSvg } from '@/utils/qrCodes';
import { useInterval } from '@/utils/hooks';
import {
  channel_states,
  channel_types,
  closeChannel,
} from '@/components/PendingConnectionsScreens/channelSlice';
import { encodeChannelQrString } from '@/utils/channels';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode
 *
 */

const Timer = ({ channel }) => {
  const navigation = useNavigation();

  const [countdown, setCountdown] = useState(
    channel ? channel.ttl - (Date.now() - channel.timestamp) : 0,
  );

  const timerTick = () => {
    if (channel && navigation.isFocused()) {
      let countDown = channel.ttl - (Date.now() - channel.timestamp);
      setCountdown(countDown);
    }
  };

  // start local timer to display countdown
  useInterval(timerTick, 1000);
  const displayTime = () => {
    const minutes = Math.floor(countdown / 60000);
    let seconds = Math.trunc((countdown % 60000) / 1000);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  return countdown > 0 ? (
    <View style={styles.timerContainer} testID="TimerContainer">
      <Text style={styles.timerTextLeft}>Expires in: </Text>
      <Text style={styles.timerTextRight}>{displayTime()}</Text>
    </View>
  ) : (
    <View style={[styles.timerContainer, { height: 20 }]} />
  );
};

export const QrCode = ({ channel }) => {
  const dispatch = useDispatch();

  // current channel displayed by QRCode

  const myName = useSelector((state) => state.user.name);

  const [qrString, setQrString] = useState('');
  const [qrsvg, setQrsvg] = useState('');

  // create QRCode from channel data
  useEffect(() => {
    if (channel && channel.state === channel_states.OPEN) {
      const newQrString = encodeChannelQrString(channel);
      // do not re-render svg if we already have the string
      if (newQrString !== qrString) {
        console.log(
          `Creating QRCode: profileId ${channel.myProfileId} channel ${channel.id}`,
        );
        setQrString(newQrString);
        qrCodeToSvg(newQrString, (qrsvg) => setQrsvg(qrsvg));
      }
    } else if (!channel || channel?.state !== channel_states.OPEN) {
      setQrString('');
      setQrsvg('');
    }
  }, [channel, qrString]);

  const copyQr = () => {
    const universalLink = `https://app.brightid.org/connection-code/${qrString}`;
    const clipboardMsg = __DEV__
      ? universalLink
      : `Connect with ${myName} on BrightID: ${universalLink}`;
    const alertMsg =
      channel?.type === channel_types.SINGLE
        ? `Share this link with one friend`
        : `Share this link`;
    Alert.alert(
      'Universal Link',
      alertMsg,
      [
        {
          text: 'Copy to Clipboard',
          onPress: () => {
            Clipboard.setString(clipboardMsg);
            if (channel?.type === channel_types.SINGLE)
              dispatch(
                closeChannel({ channelId: channel?.id, background: true }),
              );
          },
        },
      ],
      { cancelable: false },
    );
  };

  // we want to replace this QRcode with a different one for single connections

  const CopyQr = () => (
    <View style={styles.copyContainer}>
      <TouchableOpacity
        testID="CopyQrBtn"
        style={styles.copyButton}
        onPress={copyQr}
      >
        <Material
          size={24}
          name="content-copy"
          color="#333"
          style={{ width: 24, height: 24 }}
        />
        <Text style={styles.copyText}> Copy Link</Text>
      </TouchableOpacity>
    </View>
  );

  console.log('RENDERING QR CODE');

  return qrsvg ? (
    <View style={styles.qrCodeContainer} testID="QRCodeContainer">
      <Timer channel={channel} />
      <Svg
        height={DEVICE_LARGE ? '260' : '200'}
        width={DEVICE_LARGE ? '260' : '200'}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={path(['svg', '$', 'viewBox'], qrsvg)}
        shape-rendering="crispEdges"
      >
        <Path fill="#fff" d={path(['svg', 'path', '0', '$', 'd'], qrsvg)} />
        <Path stroke="#000" d={path(['svg', 'path', '1', '$', 'd'], qrsvg)} />
      </Svg>
      <CopyQr />
    </View>
  ) : (
    <View style={styles.qrCodeContainer}>
      <View style={styles.emptyQr}>
        <Spinner
          isVisible={true}
          size={47}
          type="FadingCircleAlt"
          color="#333"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  qrCodeContainer: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    // flexGrow: 1,
    paddingTop: DEVICE_LARGE ? 35 : 20,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 260 : 200,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyText: {
    color: '#333',
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
  },
  timerContainer: {
    flexDirection: 'row',
  },
  timerTextLeft: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  timerTextRight: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  emptyQr: {
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_LARGE ? 308 : 244,
  },
});

export default QrCode;
