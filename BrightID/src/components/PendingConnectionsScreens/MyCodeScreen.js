// @flow

import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
  InteractionManager,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ChannelSwitch from '@/components/Helpers/ChannelSwitch';
import { DEVICE_LARGE, ORANGE } from '@/utils/constants';
import cameraIcon from '@/static/camera_icon_white.svg';
import {
  channel_states,
  channel_types,
  selectChannelById,
  closeChannel,
  setDisplayChannelType,
  selectAllActiveChannelIdsByType,
} from '@/components/PendingConnectionsScreens/channelSlice';
import {
  selectAllPendingConnectionsByChannelIds,
  selectAlUnconfirmedConnectionsByChannelIds,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';

import { createChannel } from '@/components/PendingConnectionsScreens/actions/channelThunks';
import { setActiveNotification } from '@/actions';
import { QrCode } from './QrCode';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode
 *
 */

let FakeConnectionBtn = () => null;
let addFakeConnection = () => {};
if (__DEV__) {
  addFakeConnection = require('@/actions/fakeContact').addFakeConnection;

  FakeConnectionBtn = () => {
    const dispatch = useDispatch();
    return (
      <TouchableOpacity
        testID="fakeConnectionBtn"
        style={{ marginRight: 11 }}
        onPress={() => {
          dispatch(addFakeConnection());
        }}
      >
        <Material name="ghost" size={32} color="#fff" />
      </TouchableOpacity>
    );
  };
}

const PENDING_GROUP_TIMEOUT = 45000;

export const MyCodeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // GROUP / SINGLE
  const displayChannelType = useSelector(
    (state) => state.channels.displayChannelType,
  );
  // current channel displayed by QRCode
  const myChannel = useSelector(
    (state) =>
      selectChannelById(state, state.channels.myChannelIds[displayChannelType]),
    (a, b) => a?.id === b?.id,
  );

  // All channels with current displayChannelType actively polling profile service
  const activeChannelIds = useSelector((state) =>
    selectAllActiveChannelIdsByType(state, displayChannelType),
  );

  // pending connections attached to active channel
  const pendingConnectionSize = useSelector(
    (state) =>
      selectAllPendingConnectionsByChannelIds(state, [myChannel?.id]).length,
  );

  const unconfirmedConnectionSize = useSelector(
    (state) =>
      selectAlUnconfirmedConnectionsByChannelIds(state, activeChannelIds)
        .length,
  );

  // create channel if none exists
  useFocusEffect(
    useCallback(() => {
      if (!navigation.isFocused()) return;
      if (!myChannel || myChannel?.state !== channel_states.OPEN) {
        InteractionManager.runAfterInteractions(() => {
          dispatch(createChannel(displayChannelType));
        });
      }
      dispatch(setActiveNotification(null));
    }, [navigation, myChannel, dispatch, displayChannelType]),
  );

  // Navigate to next screen if QRCode has been scanned
  useEffect(() => {
    let timer;
    if (
      unconfirmedConnectionSize > 0 &&
      myChannel?.state === channel_states.OPEN
    ) {
      if (displayChannelType === channel_types.SINGLE) {
        // navigate immediately to pending connections
        navigation.navigate('PendingConnections');
        // close channel to prevent navigation loop
        dispatch(closeChannel({ channelId: myChannel?.id, background: true }));
      } else if (displayChannelType === channel_types.GROUP) {
        // navigation.navigate('GroupQr', { channel: myChannel });
        timer = setTimeout(() => {
          navigation.navigate('PendingConnections');
        }, PENDING_GROUP_TIMEOUT);
      }
    }
    return () => {
      clearTimeout(timer);
    };
  }, [
    displayChannelType,
    dispatch,
    navigation,
    unconfirmedConnectionSize,
    myChannel,
  ]);

  // dev button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unconfirmedConnectionSize > 0 ? (
          <TouchableOpacity
            style={{ width: DEVICE_LARGE ? 60 : 50 }}
            onPress={() => {
              navigation.navigate('PendingConnections');
            }}
          >
            <Material name="account-supervisor-circle" size={32} color="#fff" />

            <View
              style={{
                backgroundColor: '#ED1B24',
                width: 9,
                height: 9,
                borderRadius: 5,
                position: 'absolute',
                top: 2,
                left: 21,
              }}
            />
          </TouchableOpacity>
        ) : (
          <FakeConnectionBtn />
        ),
      headerTitle: () => {
        const ConnectionTitle = () => (
          <Text style={styles.headerTitle}>
            {pendingConnectionSize + 1} / 30 Connections
          </Text>
        );
        return myChannel?.type === channel_types.GROUP ? (
          __DEV__ ? (
            <TouchableWithoutFeedback
              onPress={() => {
                dispatch(addFakeConnection());
              }}
            >
              <View>
                <ConnectionTitle />
              </View>
            </TouchableWithoutFeedback>
          ) : (
            <ConnectionTitle />
          )
        ) : null;
      },
      headerTitleAlign: 'center',
    });
  }, [
    myChannel,
    dispatch,
    navigation,
    pendingConnectionSize,
    unconfirmedConnectionSize,
  ]);

  // when
  const toggleChannelType = () => {
    // toggle switch
    dispatch(
      setDisplayChannelType(
        displayChannelType === channel_types.SINGLE
          ? channel_types.GROUP
          : channel_types.SINGLE,
      ),
    );
  };

  const displayOneToOneInfo = () => {
    Alert.alert(
      'One to One',
      `This QR code can be used to connect with a single user before it expires.`,
    );
  };

  const displayManyToManyInfo = () => {
    Alert.alert(
      'Many to Many',
      'This QR code is designed for many people to connect simultaneously.',
    );
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
        <View style={styles.infoTopContainer}>
          <ChannelSwitch
            onValueChange={toggleChannelType}
            value={displayChannelType === channel_types.SINGLE}
            testID="ChannelSwitch"
          />
        </View>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>Connection Type: </Text>
          {displayChannelType === channel_types.GROUP ? (
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={displayManyToManyInfo}
              testID="ConnectionInfoGroupBtn"
            >
              <Text style={styles.infoTopText}>Many to Many </Text>
              <Material name="information-variant" size={18} color="#4a4a4a" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={displayOneToOneInfo}
              testID="ConnectionInfoSingleBtn"
            >
              <Text style={styles.infoTopText}>One to One </Text>
              <Material name="information-variant" size={18} color="#4a4a4a" />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexGrow: 2 }}>
          <QrCode channel={myChannel} />
        </View>

        <View style={styles.bottomContainer}>
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
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
    paddingTop: 20,
  },
  headerTitle: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 15,
  },
  infoTopContainer: {
    width: '100%',
    flexGrow: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTopText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    textAlign: 'center',
    color: '#4a4a4a',
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
  // verifyConnectionsButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   height: DEVICE_LARGE ? 42 : 36,
  //   backgroundColor: '#fff',
  //   borderRadius: 60,
  //   width: DEVICE_LARGE ? 240 : 200,
  //   marginBottom: 36,
  //   borderWidth: 2,
  //   borderColor: ORANGE,
  // },
  // verifyConnectionsText: {
  //   fontFamily: 'Poppins',
  //   fontWeight: 'bold',
  //   fontSize: DEVICE_LARGE ? 14 : 12,
  //   color: ORANGE,
  //   marginLeft: 10,
  // },
  emptyQr: {
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_LARGE ? 308 : 244,
  },
});

export default MyCodeScreen;
