import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useDispatch, useSelector } from '@/store/hooks';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { LIGHT_BLACK } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { qrCodeToSvg } from '@/utils/qrCodes';
import { useInterval } from '@/utils/hooks';
import { closeChannel } from '@/components/PendingConnections/channelSlice';
import { buildChannelQrUrl } from '@/utils/channels';
import { channel_states, channel_types } from '@/utils/constants';

const Timer = ({ channel }: { channel: Channel }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [countdown, setCountdown] = useState(
    channel ? channel.ttl - (Date.now() - channel.timestamp) : 0,
  );

  const timerTick = () => {
    if (channel && navigation.isFocused()) {
      const countDown = channel.ttl - (Date.now() - channel.timestamp);
      setCountdown(countDown);
    }
  };

  // start local timer to display countdown
  useInterval(timerTick, 1000);
  const displayTime = () => {
    const minutes = Math.floor(countdown / 60000);
    let seconds: string | number = Math.trunc((countdown % 60000) / 1000);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  return countdown > 0 ? (
    <View style={styles.timerContainer} testID="TimerContainer">
      <Text style={styles.timerTextLeft}>{t('qrcode.text.expiresIn')} </Text>
      <Text style={styles.timerTextRight}>{displayTime()}</Text>
    </View>
  ) : (
    <View style={[styles.timerContainer, { height: 20 }]} />
  );
};

export const QrCode = ({ channel }: { channel: Channel }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const myName = useSelector((state) => state.user.name);
  const [qrString, setQrString] = useState('');
  const [qrsvg, setQrsvg] = useState('');

  // create QRCode from channel data
  useEffect(() => {
    if (channel && channel.state === channel_states.OPEN) {
      const newQrString = buildChannelQrUrl(channel).href;
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
    const universalLink = `https://app.brightid.org/connection-code/${encodeURIComponent(
      qrString,
    )}`;

    const languageTag = i18next.resolvedLanguage;
    const expirationDate = new Date(channel.timestamp + channel.ttl);
    const dateTimeFormatOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'UTC',
      timeZoneName: 'short',
    };
    const expirationTimestamp = new Intl.DateTimeFormat(
      languageTag,
      dateTimeFormatOptions,
    ).format(expirationDate);
    console.log(expirationTimestamp);

    const clipboardMsg = __DEV__
      ? universalLink
      : channel?.type === channel_types.SINGLE
      ? t('qrcode.alert.connectSingle', {
          name: myName,
          link: universalLink,
          expirationTimestamp,
        })
      : t('qrcode.alert.connectGroup', {
          name: myName,
          link: universalLink,
          expirationTimestamp,
        });

    const alertMsg =
      channel?.type === channel_types.SINGLE
        ? t('qrcode.alert.text.shareLinkSingle')
        : t('qrcode.alert.text.shareLinkGroup');
    Alert.alert(
      t('qrcode.alert.text.universalLink'),
      alertMsg,
      [
        {
          text: t('common.button.copy'),
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
          color={LIGHT_BLACK}
          style={{ width: 24, height: 24 }}
        />
        <Text style={styles.copyText}> {t('qrcode.button.copyLink')}</Text>
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
          color={LIGHT_BLACK}
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
    color: LIGHT_BLACK,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
  },
  timerContainer: {
    flexDirection: 'row',
  },
  timerTextLeft: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
  },
  timerTextRight: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
  },
  emptyQr: {
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_LARGE ? 308 : 244,
  },
});

export default QrCode;
