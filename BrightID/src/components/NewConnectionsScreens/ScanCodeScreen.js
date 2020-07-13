// @flow

import React, { useCallback, useState } from 'react';
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
import { DEVICE_LARGE, DEVICE_IOS, ORANGE } from '@/utils/constants';
import qricon from '@/static/qr_icon_white.svg';
import {
  CHANNEL_TYPES,
  selectAllChannels,
} from '@/components/NewConnectionsScreens/channelSlice';
import {
  pendingConnection_states,
  selectAllPendingConnections,
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
  const name = useSelector((state) => state.user.name);
  const pendingConnections = useSelector(selectAllPendingConnections);
  const channels = useSelector(selectAllChannels);

  useFocusEffect(
    useCallback(() => {
      if (pendingConnections) {
        // check all pending connections. If there is a pending connection for a 1:1 channel,
        // directly open PreviewConnectionScreen.
        for (const pc of pendingConnections) {
          if (pc.state === pendingConnection_states.UNCONFIRMED) {
            const channel = channels.find(
              (channel) => channel.id === pc.channelId,
            );
            if (channel && channel.type === CHANNEL_TYPES.CHANNEL_TYPE_ONE) {
              navigation.navigate('PreviewConnection', {
                pendingConnectionId: pc.id,
              });
            }
          }
        }
      }
    }, [pendingConnections, channels, navigation]),
  );

  const handleBarCodeRead = async (data: string) => {
    console.log('barcode data', data);
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
      dispatch(joinChannel(channel));
    }
  };

  // handle deep links
  if (route.params?.qrcode && !scanned) {
    // $FlowFixMe
    handleBarCodeRead(route.params.qrcode);
  }

  const pclist = pendingConnections.map((pc) => (
    <TouchableOpacity
      key={pc.id}
      testID="ScanCodeToMyCodeBtn"
      onPress={() => {
        console.log(`Confirm connection ${pc.id}`);
        navigation.navigate('PreviewConnection', {
          pendingConnectionId: pc.id,
        });
      }}
    >
      <Text>{`${pc.name} - ${pc.id} - ${pc.channelId} - ${pc.state}`}</Text>
    </TouchableOpacity>
  ));

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
        <Text>There are {pendingConnections.length} pending connections</Text>
        {pclist}
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
