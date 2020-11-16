// @flow

import React, { useCallback, useState, useEffect } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import BarcodeMask from 'react-native-barcode-mask';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import qricon from '@/static/qr_icon_white.svg';
import {
  channel_types,
  closeChannel,
} from '@/components/PendingConnectionsScreens/channelSlice';
import { selectAlUnconfirmedConnectionsByChannelIds } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { decodeChannelQrString } from '@/utils/channels';
import { joinChannel } from '@/components/PendingConnectionsScreens/actions/channelThunks';
import { setActiveNotification } from '@/actions';
import { ORANGE } from '@/utils/constants';
import { RNCamera } from './RNCameraProvider';

/**
 * Returns whether the string is a valid QR identifier
 * @param {*} qrString
 */
function validQrString(qrString: string) {
  return qrString.length >= 42;
}

/**
 * Scan code screen of BrightID
 * ==================================================================
 * displays a react-native-camera view
 * after scanning qrcode - the rtc id is set
 *
 */

const NotAuthorizedView = () => (
  <View style={styles.cameraPreview}>
    <Text style={{ fontFamily: 'Poppins-Medium', color: '#aaa' }}>
      Camera not Authorized
    </Text>
  </View>
);

export const ScanCodeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [channel, setChannel] = useState(null);
  const [qrData, setQrData] = useState(undefined);
  const name = useSelector((state) => state.user.name);

  const pendingConnectionSizeForChannel = useSelector((state) => {
    return selectAlUnconfirmedConnectionsByChannelIds(state, [channel?.id])
      .length;
  });

  // always show scanner when navigating to this page
  useFocusEffect(
    useCallback(() => {
      setQrData(undefined);
      setChannel(null);
      dispatch(setActiveNotification(null));
    }, []),
  );

  // navigate to next page if channel has pending connections
  useEffect(() => {
    if (
      channel &&
      pendingConnectionSizeForChannel > 0 &&
      navigation.isFocused()
    ) {
      if (channel.type === channel_types.SINGLE) {
        navigation.navigate('PendingConnections');
        // close single channels to prevent navigation loop
        dispatch(closeChannel({ channelId: channel.id, background: true }));
      } else {
        navigation.navigate('GroupConnection', { channel });
      }
    }
  }, [channel, pendingConnectionSizeForChannel, navigation, dispatch]);

  // handle deep links
  useEffect(() => {
    if (route.params?.qrcode) {
      console.log(`Got qrcode ${route.params.qrcode} from Deeplink`);
      setQrData(route.params.qrcode);
    }
  }, [route.params, setQrData]);

  // handle qrcode data
  useEffect(() => {
    const handleQrData = async (qrData) => {
      try {
        if (qrData.startsWith('Recovery_')) {
          navigation.navigate('RecoveringConnection', {
            recoveryRequestCode: decodeURIComponent(qrData),
          });
        } else if (qrData.startsWith('brightid://')) {
          console.log(`handleQrData: calling Linking.openURL() with ${qrData}`);
          await Linking.openURL(qrData);
        } else if (validQrString(qrData)) {
          const channel = await decodeChannelQrString(qrData);
          setChannel(channel);
          console.log(
            `handleQrData: valid qrdata, joining channel ${channel.id}`,
          );
          await dispatch(joinChannel(channel));
        }
      } catch (err) {
        console.log(err.message);
      }
    };
    if (qrData) {
      handleQrData(qrData);
    }
  }, [dispatch, navigation, qrData]);

  const handleBarCodeRead = ({ data }: string) => {
    console.log(`Scanned QRCode: ${data}`);
    setQrData(data);
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container}>
        {!qrData ? (
          <>
            <View style={styles.infoTopContainer}>
              <Text style={styles.infoTopText}>
                Hey {name}, scan a code and
              </Text>
              <Text style={styles.infoTopText}>
                make a new connection today
              </Text>
            </View>
            <View style={styles.cameraContainer} testID="CameraContainer">
              <RNCamera
                style={styles.cameraPreview}
                captureAudio={false}
                onBarCodeRead={handleBarCodeRead}
                barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
                type={RNCamera.Constants.Type.back}
                flashMode={RNCamera.Constants.FlashMode.off}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                notAuthorizedView={<NotAuthorizedView />}
              >
                <BarcodeMask
                  edgeColor={ORANGE}
                  animatedLineColor={ORANGE}
                  width={DEVICE_LARGE ? 230 : 190}
                  height={DEVICE_LARGE ? 230 : 190}
                  edgeRadius={5}
                  edgeBorderWidth={DEVICE_LARGE ? 3 : 2}
                  edgeHeight={DEVICE_LARGE ? 30 : 25}
                  edgeWidth={DEVICE_LARGE ? 30 : 25}
                />
              </RNCamera>
            </View>
          </>
        ) : (
          <View style={styles.cameraContainer} testID="CameraContainer">
            <View style={styles.downloadingDataContainer}>
              <Text style={styles.waitingText}>
                Downloading Connection Data
              </Text>
              <Spinner
                isVisible={true}
                size={DEVICE_LARGE ? 65 : 52}
                type="ThreeBounce"
                color={ORANGE}
              />
            </View>
          </View>
        )}

        <View style={styles.bottomContainer}>
          {pendingConnectionSizeForChannel < 1 ? (
            <>
              <Text style={styles.infoBottomText}>Or you can also...</Text>
              <TouchableOpacity
                testID="ScanCodeToMyCodeBtn"
                style={styles.showQrButton}
                onPress={() => {
                  navigation.navigate('MyCode');
                }}
              >
                <SvgXml
                  xml={qricon}
                  width={DEVICE_LARGE ? 22 : 20}
                  height={DEVICE_LARGE ? 22 : 20}
                />
                <Text style={styles.showQrText}>Show your QR code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoBottomText}>
                You have {pendingConnectionSizeForChannel} pending connection
                {pendingConnectionSizeForChannel > 1 ? 's' : ''}...
              </Text>
              <TouchableOpacity
                testID="ScanCodeToPendingConnectionsBtn"
                style={styles.verifyConnectionsButton}
                onPress={() => {
                  navigation.navigate('PendingConnections');
                }}
              >
                <Material
                  name="account-multiple-plus-outline"
                  size={DEVICE_LARGE ? 32 : 26}
                  color={ORANGE}
                />
                <Text style={styles.verifyConnectionsText}>
                  Confirm Connections
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
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
    justifyContent: 'flex-start',
    flexGrow: 0.6,
    paddingTop: DEVICE_LARGE ? 40 : 25,
  },
  infoTopText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  cameraContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  cameraPreview: {
    flex: 0,
    overflow: 'hidden',
    width: DEVICE_LARGE ? 280 : 230,
    height: DEVICE_LARGE ? 280 : 230,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBottomText: {
    fontFamily: 'Poppins-Medium',
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
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 10,
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
  verifyConnectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: '#fff',
    borderRadius: 60,
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 36,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  verifyConnectionsText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: ORANGE,
    marginLeft: 10,
  },
  bottomContainer: {
    alignItems: 'center',
    minHeight: 100,
  },
  waitingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  downloadingDataContainer: {
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default ScanCodeScreen;
