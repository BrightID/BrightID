/* eslint-disable react-hooks/exhaustive-deps */
// @flow

import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE, ORANGE, DEVICE_IOS } from '@/utils/constants';
import { qrCodeToSvg } from '@/utils/qrCodes';
import { useInterval } from '@/utils/hooks';
import cameraIcon from '@/static/camera_icon_white.svg';
import { startConnecting, stopConnecting } from './actions/connecting';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode
 *
 */

const COPIED_TIMEOUT = 500;

const Container = DEVICE_IOS ? SafeAreaView : View;

export const MyCodeScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.name);
  const ttl = useSelector((state) => state.connectQrData.myQrData?.ttl ?? 0);
  const qrString = useSelector(
    (state) => state.connectQrData.myQrData?.qrString,
  );
  const timestamp = useSelector(
    (state) => state.connectQrData.myQrData?.timestamp ?? Date.now(),
  );
  const connectDataExists = useSelector((state) => !!state.connectUserData.id);

  const [qrsvg, setQrsvg] = useState('');
  const [copied, setCopied] = useState(false);

  const [countdown, setCountdown] = useState(ttl - (Date.now() - timestamp));

  const timerTick = useCallback(
    () => {
      if (!navigation.isFocused()) return;
      let countdown = ttl - (Date.now() - timestamp);
      if (countdown <= 0 && qrString) {
        dispatch(startConnecting());
      }
      setCountdown(countdown);
    },
    [ttl, timestamp, qrString],
  );

  // start local timer to display countdown
  useInterval(timerTick, 1000);
  useFocusEffect(
    useCallback(
      () => {
        console.log('YEAH BUDDY', qrString);
        if (!navigation.isFocused()) return;
        if (connectDataExists) {
          navigation.navigate('PreviewConnection');
          return;
        }
        if (!qrString) {
          dispatch(startConnecting());
        } else {
          qrCodeToSvg(qrString, (qrsvg) => setQrsvg(qrsvg));
          setCountdown(ttl - (Date.now() - timestamp));
        }
      },
      [qrString, connectDataExists],
    ),
  );

  // const checkQrCode = (qrString) => {};

  const displayTime = () => {
    const minutes = Math.floor(countdown / 60000);
    let seconds = Math.trunc((countdown % 60000) / 1000);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  const copyQr = () => {
    Clipboard.setString(`https://app.brightid.org/connection-code/${qrString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_TIMEOUT);
  };

  const renderCopyQr = () => (
    <View style={styles.copyContainer}>
      <TouchableOpacity
        testID="copyQrButton"
        style={styles.copyButton}
        onPress={copyQr}
      >
        <Material
          size={24}
          name="content-copy"
          color="#333"
          style={{ width: 24, height: 24 }}
        />
        <Text style={styles.copyText}> Copy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="resetQrButton"
        style={styles.copyButton}
        onPress={() => {
          setCountdown(ttl);
          dispatch(stopConnecting());
        }}
      >
        <Material
          size={24}
          name="refresh"
          color="#333"
          style={{ width: 24, height: 24 }}
        />
        <Text style={styles.copyText}> Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSpinner = () => (
    <Spinner
      // style={styles.spinner}
      isVisible={true}
      size={47}
      type="9CubeGrid"
      color="#4990e2"
    />
  );

  const renderTimer = () =>
    countdown > 0 ? (
      <View style={styles.timerContainer}>
        <Text style={styles.timerTextLeft}>Expires in: </Text>
        <Text style={styles.timerTextRight}>{displayTime()}</Text>
      </View>
    ) : (
      <View style={[styles.timerContainer, { height: 20 }]} />
    );

  const renderQrCode = () => (
    <Svg
      height={DEVICE_LARGE ? '260' : '200'}
      width={DEVICE_LARGE ? '260' : '200'}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={path(['svg', '$', 'viewBox'], qrsvg)}
      shape-rendering="crispEdges"
    >
      <Path
        fill={copied ? 'lightblue' : '#fff'}
        d={path(['svg', 'path', '0', '$', 'd'], qrsvg)}
      />
      <Path stroke="#000" d={path(['svg', 'path', '1', '$', 'd'], qrsvg)} />
    </Svg>
  );
  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container}>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>
            Hey {name}, share your code and
          </Text>
          <Text style={styles.infoTopText}>make a new connection today</Text>
        </View>
        <View style={styles.qrCodeContainer} testID="QRCodeContainer">
          {qrsvg ? renderTimer() : <View />}
          {qrsvg ? renderQrCode() : renderSpinner()}
          {qrsvg ? renderCopyQr() : <View />}
        </View>
        <Text style={styles.infoBottomText}>Or you can also...</Text>
        <TouchableOpacity
          testID="MyCodeToScanCodeBtn"
          style={styles.scanCodeButton}
          onPress={() => {
            props.navigation.navigate('ScanCode');
          }}
        >
          <SvgXml
            xml={cameraIcon}
            width={DEVICE_LARGE ? 22 : 20}
            height={DEVICE_LARGE ? 22 : 20}
          />
          <Text style={styles.scanCodeText}>Scan a Code</Text>
        </TouchableOpacity>
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    marginTop: -58,
    zIndex: 10,
  },
  infoTopContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  infoTopText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    textAlign: 'center',
    color: '#4a4a4a',
  },

  qrCodeContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    // borderWidth: 1,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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
  },
  timerTextRight: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  infoBottomText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 11,
    marginBottom: 10,
  },
  scanCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: 240,
    marginBottom: 36,
  },
  scanCodeText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#fff',
    marginLeft: 10,
  },
});

export default MyCodeScreen;
