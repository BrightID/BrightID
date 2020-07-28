// @flow

import React, {
  useCallback,
  useState,
  useEffect,
  useLayoutEffect,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import {
  channel_states,
  channel_types,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import { encodeChannelQrString } from '@/utils/channels';
import {
  pendingConnection_states,
  selectAllPendingConnections,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { createFakeConnection } from '@/components/Connections/models/createFakeConnection';
import {
  createChannel,
  leaveChannel,
} from '@/components/NewConnectionsScreens/actions/channelThunks';

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

export const MyCodeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.name);
  const myChannel = useSelector(
    (state) => selectChannelById(state, state.channels.myChannelId),
    (a, b) => a?.id === b?.id,
  );
  // pending connections attached to my channel
  const pendingConnections = useSelector(
    (state) =>
      selectAllPendingConnections(state).filter(
        (pc) => pc.state === pendingConnection_states.UNCONFIRMED,
      ),
    (a, b) => a.length === b.length,
  );

  const [qrString, setQrString] = useState('');
  const [qrsvg, setQrsvg] = useState('');
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(
    myChannel ? myChannel.ttl - (Date.now() - myChannel.timestamp) : 0,
  );
  const [isGroup, setIsGroup] = useState(
    myChannel ? myChannel.type === channel_types.GROUP : false,
  );

  // create QRCode from channel data
  useEffect(() => {
    if (myChannel && myChannel.state === channel_states.OPEN) {
      console.log(
        `Creating QRCode: profileId ${myChannel.myProfileId} channel ${myChannel.id}`,
      );
      const newQrString = encodeChannelQrString(myChannel);
      setQrString(newQrString);
      qrCodeToSvg(newQrString, (qrsvg) => setQrsvg(qrsvg));
    } else {
      setQrString('');
      setQrsvg('');
    }
  }, [myChannel]);

  const timerTick = () => {
    if (myChannel && navigation.isFocused()) {
      let countDown = myChannel.ttl - (Date.now() - myChannel.timestamp);
      setCountdown(countDown);
    }
  };

  // start local timer to display countdown
  // useInterval(timerTick, 100);

  // set up top right button in header
  useLayoutEffect(() => {
    if (__DEV__ && myChannel?.state === channel_states.OPEN) {
      // $FlowFixMe
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            testID="fakeConnectionBtn"
            style={{ marginRight: 11 }}
            onPress={createFakeConnection}
          >
            <Material name="ghost" size={32} color="#fff" />
          </TouchableOpacity>
        ),
      });
    }
  }, [dispatch, myChannel, navigation]);

  useFocusEffect(
    useCallback(() => {
      if (!navigation.isFocused()) return;
      if (!myChannel) {
        dispatch(
          createChannel(isGroup ? channel_types.GROUP : channel_types.SINGLE),
        );
      } else {
        setCountdown(myChannel.ttl - (Date.now() - myChannel.timestamp));
      }
    }, [navigation, myChannel, dispatch, isGroup]),
  );

  // useEffect(() => {
  //   if (myChannel && myChannel.type === channel_types.SINGLE) {
  //     // If i created a 1:1 channel and there is a pending connection in UNCONFIRMED state -> directly open PendingonnectionScreen.
  //     // there should be only one connection, but if multiple people scanned my code, the first one wins
  //     for (const pc of pendingChannelConnections) {
  //       if (pc.state === pendingConnection_states.UNCONFIRMED) {
  //         navigation.navigate('PendingConnections');
  //       }
  //     }
  //   }
  // }, [myChannel, navigation, pendingChannelConnections.length]);

  const toggleGroup = () => {
    // remove current channel
    if (myChannel) {
      dispatch(leaveChannel(myChannel.id));
    }
    // toggle switch
    setIsGroup((previousState) => !previousState);
    // create new channel. Invert `isGroup` as local state is not yet updated!
    dispatch(
      createChannel(!isGroup ? channel_types.GROUP : channel_types.SINGLE),
    );
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
    Clipboard.setString(`https://app.brightid.org/connection-code/${qrString}`);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_TIMEOUT);
  };

  const CopyQr = () => (
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

  const Timer = () =>
    countdown > 0 ? (
      <View style={styles.timerContainer}>
        <Text style={styles.timerTextLeft}>Expires in: </Text>
        <Text style={styles.timerTextRight}>{displayTime()}</Text>
      </View>
    ) : (
      <View style={[styles.timerContainer, { height: 20 }]} />
    );

  const QrCode = () => (
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

  console.log('length', pendingConnections.length);

  return (
    <>
      <View style={styles.orangeTop} />
      <Container style={styles.container}>
        <View style={styles.infoTopContainer}>
          <Switch
            trackColor={{ false: '#767577', true: ORANGE }}
            // thumbColor={isGroup ? '#f5dd4b' : '#f4f3f4'}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleGroup}
            value={isGroup}
          />
          <Text style={styles.infoTopText}>
            Group connections allow multiple people to connect simultaneously by
            only scanning one QR code.
          </Text>
          {/* //Please wait for everyone to finish scanning before proceeding to the
          next page. */}
        </View>
        {myChannel?.state === channel_states.OPEN ? (
          <View style={styles.qrCodeContainer} testID="QRCodeContainer">
            {qrsvg ? <Timer /> : <View />}
            {qrsvg ? <QrCode /> : renderSpinner()}
            {qrsvg ? <CopyQr /> : <View />}
          </View>
        ) : (
          <View style={styles.qrCodeContainer} testID="QRCodeContainer">
            <View style={styles.emptyQr} />
            {/* <Text>Your channel is closed!</Text>
            <TouchableOpacity
              testID="resetQrButton"
              style={styles.copyButton}
              onPress={() => {
                setCountdown(0);
                dispatch(
                  createChannel(
                    isGroup ? channel_types.GROUP : channel_types.SINGLE,
                  ),
                );
              }}
            >
              <Material
                size={24}
                name="refresh"
                color="#333"
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.copyText}> Create new channel</Text>
            </TouchableOpacity> */}
          </View>
        )}
        <View style={styles.bottomContainer}>
          {pendingConnections.length < 1 ? (
            <>
              <Text style={styles.infoBottomText}>Or you can also...</Text>
              <TouchableOpacity
                testID="MyCodeToScanCodeBtn"
                style={styles.scanCodeButton}
                onPress={() => {
                  navigation.navigate('ScanCode');
                }}
              >
                <SvgXml
                  xml={cameraIcon}
                  width={DEVICE_LARGE ? 22 : 20}
                  height={DEVICE_LARGE ? 22 : 20}
                />
                <Text style={styles.scanCodeText}>Scan a Code</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.infoBottomText}>
                You have {pendingConnections.length} pending connection
                {pendingConnections.length > 1 ? 's' : ''}...
              </Text>
              <TouchableOpacity
                testID="MyCodeToPendingConnections"
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
                  Verify Connections
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
    marginTop: -58,
    zIndex: 10,
  },
  infoTopContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
  },
  infoTopText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 13 : 12,
    textAlign: 'left',
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
  bottomContainer: {
    alignItems: 'center',
    minHeight: 100,
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
    width: DEVICE_LARGE ? 240 : 200,
    marginBottom: 10,
  },
  scanCodeText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#fff',
    marginLeft: 10,
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
  emptyQr: {
    height: DEVICE_LARGE ? 308 : 244,
  },
});

export default MyCodeScreen;
