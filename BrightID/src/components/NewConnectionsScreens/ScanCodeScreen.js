// @flow

import React, { useCallback, useState, useEffect } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import BarcodeMask from 'react-native-barcode-mask';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

import { DEVICE_LARGE, DEVICE_IOS, ORANGE } from '@/utils/constants';
import qricon from '@/static/qr_icon_white.svg';
import {
  channel_types,
  selectAllChannels,
} from '@/components/NewConnectionsScreens/channelSlice';
import {
  pendingConnection_states,
  selectAllUnconfirmedConnections,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { decodeChannelQrString } from '@/utils/channels';
import { joinChannel } from '@/components/NewConnectionsScreens/actions/channelThunks';
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

const Container = DEVICE_IOS ? SafeAreaView : View;

export const ScanCodeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [scanned, setScanned] = useState(false);
  const [channel, setChannel] = useState(null);
  const name = useSelector((state) => state.user.name);
  const pendingConnections = useSelector(selectAllUnconfirmedConnections);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setChannel(null);
    }, []),
  );

  useEffect(() => {
    if (channel) {
      channel.type === channel_types.SINGLE
        ? navigation.navigate('PendingConnections')
        : navigation.navigate('GroupConnection', { channel });
    }
  }, [pendingConnections]);

  const handleBarCodeRead = async ({ data }: string) => {
    if (!data) return;

    setScanned(true);

    if (data.startsWith('Recovery_')) {
      navigation.navigate('RecoveringConnection', {
        recoveryRequestCode: data,
      });
    } else if (data.startsWith('brightid://')) {
      await Linking.openURL(data);
    } else if (validQrString(data)) {
      const channel = await decodeChannelQrString(data);
      await dispatch(joinChannel(channel));
      setChannel(channel);
    }
  };

  // handle deep links
  if (route.params?.qrcode && !scanned) {
    // $FlowFixMe
    handleBarCodeRead({ data: route.params.qrcode });
  }

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container}>
        {!scanned ? (
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
            </View>
          </>
        ) : (
          <View style={styles.cameraPreview}>
            <Text style={styles.waitingText}>Downloading Connection Data</Text>
            <Spinner
              isVisible={true}
              size={60}
              type="ThreeBounce"
              color={ORANGE}
            />
          </View>
        )}

        <View style={styles.bottomContainer}>
          {pendingConnections.length < 1 ? (
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
                You have {pendingConnections.length} pending connection
                {pendingConnections.length > 1 ? 's' : ''}...
              </Text>
              <TouchableOpacity
                testID="ScanCodeToPendingConnectionsBtn"
                style={styles.confirmConnectionsButton}
                onPress={() => {
                  navigation.navigate('PendingConnections');
                }}
              >
                <Material
                  name="account-multiple-plus-outline"
                  size={DEVICE_LARGE ? 32 : 26}
                  color={ORANGE}
                />
                <Text style={styles.confirmConnectionsText}>
                  Confirm Connections
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    width: DEVICE_LARGE ? 260 : 210,
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
  confirmConnectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: '#fff',
    borderRadius: 60,
    width: DEVICE_LARGE ? 260 : 210,
    marginBottom: 36,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  confirmConnectionsText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: ORANGE,
    marginLeft: 10,
  },
  bottomContainer: {
    alignItems: 'center',
  },
  waitingText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
});
export default ScanCodeScreen;
