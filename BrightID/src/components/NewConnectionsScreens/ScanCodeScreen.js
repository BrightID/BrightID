/* eslint-disable react-hooks/exhaustive-deps */
// @flow

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeMask from 'react-native-barcode-mask';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-spinkit';
import {
  DEVICE_LARGE,
  DEVICE_IOS,
  PROFILE_POLL_INTERVAL,
  QR_TYPE_RESPONDER,
  ORANGE,
} from '@/utils/constants';
import { parseQrData } from '@/utils/qrCodes';
import qricon from '@/static/qr_icon_white.svg';
import { RNCamera } from './RNCameraProvider';
import emitter from '../../emitter';
import { setConnectQrData } from '../../actions';
import { fetchProfile } from './actions/profile';

/**
 * Returns whether the string is a valid QR identifier
 * @param {*} qrString
 */
function validQrString(qrString) {
  return qrString.length >= 42;
}

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
 *
 */

let fetchProfileId: IntervalID;
let connectionExpired: TimeoutID;

const Container = DEVICE_IOS ? SafeAreaView : View;

export const ScanCodeScreen = (props) => {
  const { navigation, route } = props;
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const name = useSelector((state) => state.user.name);
  const connectDataExists = useSelector((state) => !!state.connectUserData.id);

  useFocusEffect(
    useCallback(() => {
      // dispatch(stopConnecting());
      if (connectDataExists) {
        unsubscribeToProfileUpload();
        navigation.navigate('PreviewConnection');
        return;
      }
      const handleDownloadFailure = () => {
        setConnectionAttempts(connectionAttempts + 1);
        if (connectionAttempts > 1) {
          navigation.navigate('Home');
        }
      };

      emitter.on('connectFailure', handleDownloadFailure);

      return () => {
        unsubscribeToProfileUpload();

        emitter.off('connectFailure', handleDownloadFailure);
      };
    }, [connectionAttempts, connectDataExists]),
  );

  const subscribeToProfileUpload = (peerQrData) => {
    console.log(`Subscribing to profile Upload for uuid ${peerQrData.uuid}`);

    connectionExpired = setTimeout(showProfileError, 90000);
    fetchProfileId = setInterval(() => {
      dispatch(fetchProfile(peerQrData));
    }, PROFILE_POLL_INTERVAL);
  };

  const unsubscribeToProfileUpload = () => {
    console.log(`Unsubsubscribing from profile Upload`);
    clearTimeout(connectionExpired);
    clearInterval(fetchProfileId);
  };

  const handleBarCodeRead = ({ data }) => {
    console.log('barcode data', data);
    if (!data) return;

    if (data.startsWith('Recovery_')) {
      props.navigation.navigate('RecoveringConnection', {
        recoveryRequestCode: data,
      });
    } else if (data.startsWith('brightid://')) {
      Linking.openURL(data);
    } else if (validQrString(data)) {
      const peerQrData = parseQrData(data);
      peerQrData.type = QR_TYPE_RESPONDER;
      dispatch(setConnectQrData(peerQrData));
      subscribeToProfileUpload(peerQrData);
    }
    setScanned(true);
  };

  // handle deep links
  if (route.params?.qrcode && !scanned) {
    handleBarCodeRead({ data: route.params?.qrcode });
  }

  const showProfileError = () => {
    Alert.alert(
      'Timeout reached',
      "There was a problem downloading the other person's profile. Please try again.",
    );
    setScanned(true);
  };

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container}>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>Hey {name}, scan a code and</Text>
          <Text style={styles.infoTopText}>make a new connection today</Text>
        </View>
        <View style={styles.cameraContainer} testID="CameraContainer">
          {!scanned ? (
            <RNCamera
              style={styles.cameraPreview}
              captureAudio={false}
              onBarCodeRead={handleBarCodeRead}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.off}
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
            >
              <BarcodeMask
                edgeColor={ORANGE}
                animatedLineColor={ORANGE}
                width={230}
                height={230}
                edgeRadius={5}
                edgeBorderWidth={3}
                edgeHeight={30}
                edgeWidth={30}
              />
            </RNCamera>
          ) : (
            <View style={styles.cameraPreview}>
              <Spinner isVisible={true} size={41} type="Wave" color="#4990e2" />
            </View>
          )}
        </View>
        <Text style={styles.infoBottomText}>Or you can also...</Text>
        <TouchableOpacity
          testID="ScanCodeToMyCodeBtn"
          style={styles.showQrButton}
          onPress={() => {
            props.navigation.navigate('MyCode');
          }}
        >
          <SvgXml
            xml={qricon}
            width={DEVICE_LARGE ? 22 : 20}
            height={DEVICE_LARGE ? 22 : 20}
          />
          <Text style={styles.showQrText}>Show your QR code</Text>
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
    zIndex: 10,
    marginTop: -58,
  },
  infoTopContainer: {
    width: '100%',
    justifyContent: 'center',
    flexGrow: 1,
  },
  infoTopText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  cameraContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    // borderWidth: 1,
  },
  cameraPreview: {
    flex: 0,
    overflow: 'hidden',
    width: 280,

    height: 280,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBottomText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 11,
    marginBottom: 10,
  },
  showQrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: 260,
    marginBottom: 36,
  },
  showQrText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#fff',
    marginLeft: 10,
  },
  cameraIcon: {
    marginTop: 2,
    marginRight: 4,
  },
});

export default ScanCodeScreen;
