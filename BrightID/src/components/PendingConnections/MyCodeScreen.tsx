import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  AlertButton,
  InteractionManager,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from '@/store/hooks';
import ChannelSwitch from '@/components/Helpers/ChannelSwitch';
import { DARK_GREY, LIGHT_BLACK, ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import Camera from '@/components/Icons/Camera';
import {
  closeChannel,
  selectAllActiveChannelIdsByType,
  selectChannelById,
  setDisplayChannelType,
} from '@/components/PendingConnections/channelSlice';
import {
  selectAllPendingConnectionsByChannelIds,
  selectAllUnconfirmedConnectionsByChannelIds,
} from '@/components/PendingConnections/pendingConnectionSlice';
import {
  createChannel,
  leaveChannelsByType,
} from '@/components/PendingConnections/actions/channelThunks';
import { setActiveNotification } from '@/actions';
import { QrCode } from './QrCode';
import {
  channel_states,
  channel_types,
  GROUP_CHANNEL_CONNECTION_LIMIT,
  STAR_CHANNEL_CONNECTION_LIMIT,
} from '@/utils/constants';

/**
 * My Code screen of BrightID
 *
 * displays a qrcode
 *
 */
let FakeConnectionBtn = () => null;
let addFakeConnection = () => null;
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
        <Material name="ghost" size={32} color={WHITE} />
      </TouchableOpacity>
    );
  };
}

const PENDING_GROUP_TIMEOUT = 45000;

export const MyCodeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [creatingChannel, setCreatingChannel] = useState(false);

  // GROUP / SINGLE / STAR
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

  console.log('activeChannelIds', activeChannelIds);

  // pending connections attached to active channel
  const pendingConnectionSize = useSelector((state) => {
    if (myChannel) {
      return selectAllPendingConnectionsByChannelIds(state, [myChannel.id])
        .length;
    } else {
      return 0;
    }
  });

  const unconfirmedConnectionSize = useSelector(
    (state) =>
      selectAllUnconfirmedConnectionsByChannelIds(state, activeChannelIds)
        .length,
  );

  // create channel if none exists
  useEffect(() => {
    if (!navigation.isFocused()) return;
    if (creatingChannel) return;
    if (!myChannel || myChannel?.state !== channel_states.OPEN) {
      setCreatingChannel(true);
      console.log(`creating new channel of type ${displayChannelType}.`);
      InteractionManager.runAfterInteractions(async () => {
        try {
          await dispatch(createChannel(displayChannelType));
          setCreatingChannel(false);
        } catch (err) {
          console.log(`error creating channel: ${err.message}`);
          let buttons: AlertButton[] = [
            {
              text: 'OK',
              style: 'default',
              onPress: () => {
                setCreatingChannel(false);
              },
            },
          ];
          if (err.message === 'Too many channels') {
            buttons = [
              {
                text: 'Wait',
                style: 'default',
                onPress: () => {
                  navigation.goBack();
                  setCreatingChannel(false);
                },
              },
              {
                text: 'Close single-use channels',
                style: 'destructive',
                onPress: () => {
                  dispatch(leaveChannelsByType(channel_types.SINGLE));
                  dispatch(createChannel(displayChannelType));
                  setCreatingChannel(false);
                },
              },
            ];
          }
          Alert.alert(
            t('common.alert.error'),
            t('pendingConnection.alert.text.errorCreateChannel', {
              message: `${err.message}`,
            }),
            buttons,
          );
        }
      });
    }
    dispatch(setActiveNotification(null));
  }, [navigation, myChannel, dispatch, displayChannelType, t, creatingChannel]);

  // Navigate to next screen if QRCode has been scanned
  useEffect(() => {
    let timer;
    if (
      unconfirmedConnectionSize > 0 &&
      myChannel?.state === channel_states.OPEN
    ) {
      switch (displayChannelType) {
        case channel_types.SINGLE:
          // navigate immediately to pending connections
          navigation.navigate('PendingConnections');
          // close channel to prevent navigation loop
          dispatch(
            closeChannel({ channelId: myChannel?.id, background: true }),
          );
          break;
        case channel_types.GROUP:
        case channel_types.STAR:
          timer = setTimeout(() => {
            navigation.navigate('PendingConnections');
          }, PENDING_GROUP_TIMEOUT);
          break;
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
            <Material
              name="account-supervisor-circle"
              size={32}
              color={WHITE}
            />

            <View
              style={{
                backgroundColor: ORANGE,
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
            {t('qrcode.header.connections', {
              count: pendingConnectionSize + 1,
              max:
                myChannel?.type === channel_types.STAR
                  ? STAR_CHANNEL_CONNECTION_LIMIT
                  : GROUP_CHANNEL_CONNECTION_LIMIT,
            })}
          </Text>
        );
        const group_types: Array<string> = [
          channel_types.GROUP,
          channel_types.STAR,
        ];
        return group_types.includes(myChannel?.type) ? (
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
    t,
  ]);

  const toggleChannelType = () => {
    dispatch(
      setDisplayChannelType(
        displayChannelType === channel_types.SINGLE
          ? channel_types.GROUP
          : channel_types.SINGLE,
      ),
    );
  };

  const setStarChannelType = () => {
    console.log(`LongPress`);
    dispatch(setDisplayChannelType(channel_types.STAR));
  };

  const displayOneToOneInfo = () => {
    Alert.alert(
      t('qrcode.alert.title.codeSingle'),
      t('qrcode.alert.text.codeSingle'),
    );
  };

  const displayManyToManyInfo = () => {
    Alert.alert(
      t('qrcode.alert.title.codeGroup'),
      t('qrcode.alert.text.codeGroup'),
    );
  };

  const displayOneToManyInfo = () => {
    Alert.alert(
      t('qrcode.alert.title.codeStar', 'Star code'),
      t(
        'qrcode.alert.text.codeStar',
        'This QR code is designed to connect many people with one person.',
      ),
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
      <View style={styles.container} testID="MyCodeScreen">
        <View style={styles.infoTopContainer}>
          {displayChannelType === channel_types.STAR ? (
            <TouchableOpacity
              style={styles.starContainer}
              onPress={toggleChannelType}
            >
              <Material name="star" size={30} color={WHITE} />
            </TouchableOpacity>
          ) : (
            <ChannelSwitch
              onValueChange={toggleChannelType}
              value={displayChannelType === channel_types.SINGLE}
              onLongPress={setStarChannelType}
              testID="ChannelSwitch"
            />
          )}
        </View>
        <View style={styles.infoTopContainer}>
          <Text style={styles.infoTopText}>
            {t('qrcode.label.connectionType')}{' '}
          </Text>
          {displayChannelType === channel_types.GROUP && (
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={displayManyToManyInfo}
              testID="ConnectionInfoGroupBtn"
            >
              <Text testID="group-code" style={styles.infoTopText}>
                {t('qrcode.text.codeGroup')}
              </Text>
              <Material
                name="information-variant"
                size={18}
                color={LIGHT_BLACK}
              />
            </TouchableOpacity>
          )}
          {displayChannelType === channel_types.SINGLE && (
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={displayOneToOneInfo}
              testID="ConnectionInfoSingleBtn"
            >
              <Text testID="single-use-code" style={styles.infoTopText}>
                {t('qrcode.text.codeSingle')}
              </Text>
              <Material
                name="information-variant"
                size={18}
                color={LIGHT_BLACK}
              />
            </TouchableOpacity>
          )}
          {displayChannelType === channel_types.STAR && (
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={displayOneToManyInfo}
              testID="ConnectionInfoStarBtn"
            >
              <Text testID="star-code" style={styles.infoTopText}>
                {t('qrcode.text.codeStar', 'Star code')}
              </Text>
              <Material
                name="information-variant"
                size={18}
                color={LIGHT_BLACK}
              />
            </TouchableOpacity>
          )}
        </View>
        <View style={{ flexGrow: 2 }}>
          <QrCode channel={myChannel} />
        </View>

        <View style={styles.bottomContainer}>
          <Text style={styles.infoBottomText}>{t('qrcode.text.canAlso')}</Text>
          <TouchableOpacity
            testID="MyCodeToScanCodeBtn"
            style={styles.scanCodeButton}
            onPress={() => {
              navigation.navigate('ScanCode');
            }}
          >
            <Camera
              color={WHITE}
              width={DEVICE_LARGE ? 22 : 20}
              height={DEVICE_LARGE ? 22 : 20}
            />
            <Text style={styles.scanCodeText}>
              {t('qrcode.button.scanCode')}
            </Text>
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
    backgroundColor: WHITE,
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
    color: WHITE,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
  },
  infoTopContainer: {
    width: '100%',
    flexGrow: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTopText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    textAlign: 'center',
    color: LIGHT_BLACK,
  },
  bottomContainer: {
    alignItems: 'center',
    minHeight: 100,
  },
  infoBottomText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
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
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 10,
  },
  emptyQr: {
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_LARGE ? 308 : 244,
  },
  starContainer: {
    flexDirection: 'row',
    width: DEVICE_LARGE ? 80 : 70,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: DEVICE_LARGE ? 5 : 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ORANGE,
    borderColor: DARK_GREY,
  },
});

export default MyCodeScreen;
