// @flow

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from '@/emitter';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
import { qrCodeToSvg } from '@/utils/qrCodes';
import { useInterval } from '@/utils/hooks';
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

export const MyCodeScreen = (props) => {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.name);
  const ttl = useSelector((state) => state.connectQrData.myQrData?.ttl ?? 0);
  const qrString = useSelector(
    (state) => state.connectQrData.myQrData?.qrString,
  );
  const timestamp = useSelector(
    (state) => state.connectQrData.myQrData?.timestamp ?? Date.now(),
  );

  const [qrsvg, setQrsvg] = useState('');
  const [copied, setCopied] = useState(false);

  const [countdown, setCountdown] = useState(ttl - (Date.now() - timestamp));
  console.log('countdown', countdown);

  const timerTick = () => {
    let countdown = ttl - (Date.now() - timestamp);
    if (countdown <= 0) {
      dispatch(startConnecting());
    }
    setCountdown(countdown);
  };

  // start local timer to display countdown
  useInterval(timerTick, 1000);

  useEffect(() => {
    // reset QRcode when app loads
    // dispatch(stopConnecting());
    checkQrCode(qrString);
    emitter.on('connectDataReady', navigateToPreview);
    return () => {
      emitter.off('connectDataReady', navigateToPreview);
    };
  }, [qrString]);

  const navigateToPreview = () => {
    props.navigation.navigate('PreviewConnection');
  };

  const checkQrCode = (qrString) => {
    if (!qrString) {
      console.log(`Triggering generation of new QRCodeData`);
      dispatch(startConnecting());
    } else {
      // qrData is available, now create actual qrCode image
      console.log(`Using QRCodeData (${qrString})`);
      qrCodeToSvg(qrString, (qrsvg) => setQrsvg(qrsvg));
      setCountdown(ttl - (Date.now() - timestamp));
    }
  };

  const displayTime = () => {
    const minutes = Math.floor(countdown / 60000);
    let seconds = Math.trunc((countdown % 60000) / 1000);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  const copyQr = () => {
    Clipboard.setString(qrString);
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
        testID="copyQrButton"
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
      height={DEVICE_LARGE ? '260' : '180'}
      width={DEVICE_LARGE ? '260' : '180'}
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
      <View style={styles.container}>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>
            Hey {name}, share your code and
          </Text>
          <Text style={styles.infoTopText}>make a new connection today</Text>
        </View>
        <View style={styles.qrCodeContainer}>
          {qrsvg ? renderTimer() : <View />}
          {qrsvg ? renderQrCode() : renderSpinner()}
          {qrsvg ? renderCopyQr() : <View />}
        </View>
        <Text style={styles.infoBottomText}>Or you can also...</Text>
        <TouchableOpacity
          style={styles.scanCodeButton}
          onPress={() => {
            props.navigation.navigate('ScanCode');
          }}
        >
          <Material
            name="camera"
            color="#fff"
            size={16}
            style={styles.cameraIcon}
          />
          <Text style={styles.scanCodeText}>Scan a Code</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    zIndex: 10,
    marginTop: -58,
  },
  infoTopContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 56,
    // flexGrow: 1,
  },
  infoTopText: {
    // fontFamily: 'ApexNew-Book',
    fontSize: 16,
    textAlign: 'center',
    color: '#4a4a4a',
  },

  qrCodeContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '75%',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // minHeight: 25,
    // minWidth: 100,
  },
  copyText: {
    color: '#333',
    // fontFamily: 'ApexNew-Book',
  },
  timerContainer: {
    flexDirection: 'row',
  },
  timerTextLeft: {
    // fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  timerTextRight: {
    // fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  infoBottomText: {
    fontSize: 12,
    marginBottom: 10,
  },
  scanCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: 220,
    marginBottom: 36,
  },
  scanCodeText: {
    fontSize: 14,
    color: '#fff',
  },
  cameraIcon: {
    marginTop: 1.5,
    marginRight: 4,
  },
});

export default MyCodeScreen;
