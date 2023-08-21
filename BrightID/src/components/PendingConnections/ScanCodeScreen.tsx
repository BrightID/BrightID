import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { Trans, useTranslation } from 'react-i18next';
import BarcodeMask from 'react-native-barcode-mask';
import { Wave } from 'react-native-animated-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import i18next from 'i18next';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { useDispatch, useSelector } from '@/store/hooks';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { closeChannel } from '@/components/PendingConnections/channelSlice';
import { selectAllUnconfirmedConnectionsByChannelIds } from '@/components/PendingConnections/pendingConnectionSlice';
import { parseChannelQrURL } from '@/utils/channels';
import { joinChannel } from '@/components/PendingConnections/actions/channelThunks';
import { setActiveNotification } from '@/actions';
import { hash } from '@/utils/encoding';
import { channel_types, qrCodeURL_types } from '@/utils/constants';
import {
  setRecoveryAesKey,
  setRecoveryChannel,
} from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import QrCode from './QrCode';

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
 * displays a expo-camera view
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
  const [hasPermission, setHasPermission] = useState(null);
  const name = useSelector((state) => state.user.name);
  const { t } = useTranslation();

  const pendingConnectionSizeForChannel = useSelector((state) => {
    if (channel) {
      return selectAllUnconfirmedConnectionsByChannelIds(state, [channel.id])
        .length;
    } else {
      return 0;
    }
  });

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

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
      switch (channel.type) {
        case channel_types.SINGLE:
        case channel_types.STAR:
          // only one peer connection expected
          navigation.navigate('PendingConnections');
          // close single channels to prevent navigation loop
          dispatch(closeChannel({ channelId: channel.id, background: true }));
          break;
        case channel_types.GROUP:
          // Expect multiple peers, so show group connection screen
          navigation.navigate('GroupConnection', { channel });
          break;
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
        if (qrData.startsWith('brightid://')) {
          console.log(`handleQrData: calling Linking.openURL() with ${qrData}`);
          await Linking.openURL(qrData);
        } else if (validQrString(qrData)) {
          const channelURL = new URL(qrData);
          // Pop 'type' parameter from url if it is included
          const urlType = channelURL.searchParams.get('t');
          if (urlType) channelURL.searchParams.delete('t');

          switch (urlType) {
            case qrCodeURL_types.RECOVERY:
            case qrCodeURL_types.SYNC:
            case qrCodeURL_types.IMPORT: {
              // Pop 'aes' parameter from url
              const aesKey = channelURL.searchParams.get('aes');
              channelURL.searchParams.delete('aes');

              const changePrimaryDevice =
                channelURL.searchParams.get('p') === 'true';
              channelURL.searchParams.delete('p');

              const channelId = hash(aesKey);
              console.log(
                `handleQrData: Got type ${urlType} recovery channel ${channelId} at ${channelURL.href}`,
              );

              dispatch(setRecoveryAesKey(aesKey));
              dispatch(
                setRecoveryChannel({
                  channelId,
                  url: channelURL,
                }),
              );
              if (urlType === qrCodeURL_types.RECOVERY) {
                navigation.navigate('RecoveringConnection');
              } else if (urlType === qrCodeURL_types.SYNC) {
                navigation.navigate('Devices', {
                  syncing: true,
                  asScanner: true,
                });
              } else if (urlType === qrCodeURL_types.IMPORT) {
                navigation.navigate('Add Device', {
                  changePrimaryDevice,
                });
              }
              break;
            }
            case qrCodeURL_types.CONNECTION:
            default: {
              // Currently assuming qrcodes without type parameter are connection channels created by previous app
              // versions. Change this in one of the next releases:
              // -> Add type parameter 't' to connection channel qrcode
              // -> Throw an error if no/unknown type is found in qrcode
              console.log(
                `handleQrData: Got connection channel at ${channelURL.href}`,
              );
              const channel = await parseChannelQrURL(channelURL);
              setChannel(channel);
              await dispatch(joinChannel(channel));
              break;
            }
          }
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

  const handleBarCodeRead = ({ data }: BarCodeScannerResult) => {
    console.log(`Scanned QRCode: ${data}`);
    setQrData(data);
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <NotAuthorizedView />;
  }

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
              <BarCodeScanner
                style={styles.cameraPreview}
                onBarCodeScanned={handleBarCodeRead}
                barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                type={BarCodeScanner.Constants.Type.back}
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
              </BarCodeScanner>
            </View>
          </>
        ) : (
          <View style={styles.cameraContainer} testID="CameraContainer">
            <View style={styles.downloadingDataContainer}>
              <Text style={styles.waitingText}>
                {t('qrcode.text.downloadingConnectionData')}
              </Text>
              <Wave
                animating={true}
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
