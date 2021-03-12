import React, { useCallback, useState, useEffect } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
} from 'react-native';
import {
  useFocusEffect,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { Trans, useTranslation } from 'react-i18next';
import BarcodeMask from 'react-native-barcode-mask';
import { useDispatch, useSelector } from '@/store';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { ORANGE, WHITE, LIGHT_BLACK, GREY } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import {
  channel_types,
  closeChannel,
} from '@/components/PendingConnections/channelSlice';
import { selectAllUnconfirmedConnectionsByChannelIds } from '@/components/PendingConnections/pendingConnectionSlice';
import { parseChannelQrURL } from '@/utils/channels';
import { joinChannel } from '@/components/PendingConnections/actions/channelThunks';
import { setActiveNotification } from '@/actions';
import i18next from 'i18next';
import { BarCodeReadEvent } from 'react-native-camera';
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
    <Text style={{ fontFamily: 'Poppins-Medium', color: GREY }}>
      Camera not Authorized
    </Text>
  </View>
);

export const ScanCodeScreen = () => {
  const route: { params?: { qrcode: string } } = useRoute() as {
    params?: { qrcode: string };
  };
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [channel, setChannel] = useState(null);
  const [qrData, setQrData] = useState(undefined);
  const name = useSelector((state: State) => state.user.name);
  const { t } = useTranslation();

  const pendingConnectionSizeForChannel = useSelector((state: State) => {
    if (channel) {
      return selectAllUnconfirmedConnectionsByChannelIds(state, [channel.id])
        .length;
    } else {
      return 0;
    }
  });

  // always show scanner when navigating to this page
  useFocusEffect(
    useCallback(() => {
      setQrData(undefined);
      setChannel(null);
      dispatch(setActiveNotification(null));
    }, [dispatch]),
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
      setQrData(decodeURIComponent(route.params.qrcode));
    }
  }, [route.params, setQrData]);

  // handle qrcode data
  useEffect(() => {
    const handleQrData = async (qrData) => {
      try {
        if (qrData.startsWith('Recovery2_')) {
          navigation.navigate('RecoveringConnection', {
            aesKey: decodeURIComponent(qrData.replace('Recovery2_', '')),
          });
        } else if (qrData.startsWith('brightid://')) {
          console.log(`handleQrData: calling Linking.openURL() with ${qrData}`);
          await Linking.openURL(qrData);
        } else if (validQrString(qrData)) {
          const channelURL = new URL(qrData);
          console.log(
            `handleQrData: valid channelURL, joining channel at ${channelURL.href}`,
          );
          const channel = await parseChannelQrURL(channelURL);
          setChannel(channel);
          await dispatch(joinChannel(channel));
        } else {
          throw Error(`Can not parse QRData ${qrData}`);
        }
      } catch (err) {
        console.log(err.message);
        Alert.alert(
          i18next.t('common.alert.error'),
          i18next.t('pendingConnection.alert.text.errorJoinChannel', {
            message: `${err.message}`,
          }),
        );
        setQrData(undefined);
      }
    };
    if (qrData) {
      handleQrData(qrData);
    }
  }, [dispatch, navigation, qrData]);

  const handleBarCodeRead = ({ data }: BarCodeReadEvent) => {
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
              <Trans
                i18nKey="qrcode.text.scanCode"
                components={{ text: <Text style={styles.infoTopText} /> }}
                values={{ name }}
              />
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
                  title: t('common.camera.title'),
                  message: t('common.camera.message'),
                  buttonPositive: t('common.camera.ok'),
                  buttonNegative: t('common.camera.cancel'),
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
                {t('qrcode.text.downloadingConnectionData')}
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
              <Text style={styles.infoBottomText}>
                {t('qrcode.text.canAlso')}
              </Text>
              <TouchableOpacity
                testID="ScanCodeToMyCodeBtn"
                style={styles.showQrButton}
                onPress={() => {
                  navigation.navigate('MyCode');
                }}
              >
                <Material
                  name="qrcode"
                  size={DEVICE_LARGE ? 22 : 20}
                  color={WHITE}
                />

                <Text style={styles.showQrText}>
                  {t('qrcode.button.showCode')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoBottomText}>
                {t('qrcode.text.pendingConnections', {
                  count: pendingConnectionSizeForChannel,
                })}
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
                  {t('qrcode.text.confirmConnections')}
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
    backgroundColor: WHITE,
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
    fontSize: fontSize[16],
    textAlign: 'center',
    color: LIGHT_BLACK,
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
    fontSize: fontSize[12],
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
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
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
    backgroundColor: WHITE,
    borderRadius: 60,
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 36,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  verifyConnectionsText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: ORANGE,
    marginLeft: 10,
  },
  bottomContainer: {
    alignItems: 'center',
    minHeight: 100,
  },
  waitingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
  },
  downloadingDataContainer: {
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default ScanCodeScreen;
