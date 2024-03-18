import React, { useState, useContext, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import CheckBox from '@react-native-community/checkbox';
import { useSelector, useDispatch } from '@/store/hooks';
import { selectActiveDevices } from '@/reducer/devicesSlice';
import { fontSize } from '@/theme/fonts';
import {
  WHITE,
  ORANGE,
  BLUE,
  BLACK,
  GREY,
  DARK_ORANGE,
  DARKER_GREY,
  RED,
} from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { useNodeApiContext } from '@/context/NodeApiContext';
import {
  removeDevice,
  selectIsPrimaryDevice,
  selectKeypair,
  setLastSyncTime,
  setPrimaryDevice,
} from '@/actions';
import { qrCodeURL_types } from '@/utils/constants';
import {
  pollImportChannel,
  clearImportChannel,
  getOtherSideDeviceInfo,
} from './thunks/channelThunks';
import {
  uploadAllInfoAfter,
  uploadDeviceInfo,
} from './thunks/channelUploadThunks';
import {
  resetRecoveryData,
  selectRecoveryChannel,
  uploadCompletedByOtherSide,
} from '../RecoveryFlow/recoveryDataSlice';

/* Description */

/* ======================================== */

/**
 * Screen for listing devices
 */

/* Devices Screen */

/* ======================================== */
export const DevicesScreen = ({ route }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { api } = useNodeApiContext();
  const { publicKey: signingKey } = useSelector(selectKeypair);
  const devices = useSelector(selectActiveDevices).sort((a, _b) =>
    a.signingKey === signingKey ? -1 : 1,
  );
  const settings = useSelector((state) => state.settings);
  const syncCompleted = useSelector(uploadCompletedByOtherSide);
  const isPrimary = useSelector(selectIsPrimaryDevice);
  const { url, channelId } = useSelector(selectRecoveryChannel);

  const shortenSigningKey = (s) => `${s.slice(0, 6)}...${s.slice(-6)}`;
  const isCurrentDevice = (d) => d.signingKey === signingKey;
  const getName = (d) =>
    isCurrentDevice(d) ? 'Current device' : d.name || 'Unknown name';
  const [waiting, setWaiting] = useState(!!route.params?.syncing);

  useEffect(() => {
    const runEffect = async () => {
      const { isPrimaryDevice: otherPrimary, lastSyncTime } =
        await getOtherSideDeviceInfo(url, channelId);
      if (otherPrimary && isPrimary) {
        setWaiting(false);
        dispatch(resetRecoveryData());
        return Alert.alert(
          t('common.alert.error'),
          t('devices.alert.bothPrimary'),
        );
      } else if (!otherPrimary && !isPrimary) {
        setWaiting(false);
        dispatch(resetRecoveryData());
        return Alert.alert(
          t('common.alert.error'),
          t('devices.alert.noPrimary'),
        );
      }
      if (!isPrimary) {
        await dispatch(uploadDeviceInfo());
      }
      const after = isPrimary ? lastSyncTime : settings.lastSyncTime;
      await dispatch(uploadAllInfoAfter(after));
      dispatch(pollImportChannel());
    };
    const showConfirmDialog = () => {
      return Alert.alert(
        t('common.alert.title.pleaseConfirm'),
        t('devices.alert.confirmSync'),
        [
          {
            text: t('common.alert.yes'),
            onPress: () => {
              runEffect();
            },
          },
          {
            text: t('common.alert.no'),
            onPress: () => {
              navigation.navigate('HomeScreen');
            },
          },
        ],
      );
    };
    if (route.params?.asScanner) {
      showConfirmDialog();
    }
  }, [
    dispatch,
    navigation,
    route.params?.asScanner,
    isPrimary,
    settings.lastSyncTime,
    t,
    url,
    channelId,
  ]);

  useEffect(() => {
    setWaiting(!!route.params?.syncing);
  }, [route.params?.syncing]);

  useFocusEffect(() => {
    // this is triggered when navigating back from sync code screen
    if (waiting && syncCompleted) {
      Alert.alert(t('common.alert.info'), t('devices.text.syncCompleted'));
      clearImportChannel();
      setWaiting(false);
      if (!isPrimary) {
        dispatch(setLastSyncTime(Date.now()));
      }
      dispatch(resetRecoveryData());
    }
  });

  const sync = () => {
    navigation.navigate('SyncCode', {
      urlType: qrCodeURL_types.SYNC,
      action: 'sync',
    });
  };

  const remove = (device) => {
    Alert.alert(
      t('common.alert.title.pleaseConfirm'),
      t('devices.alert.confirmRemove', { name: getName(device) }),
      [
        {
          text: t('common.alert.yes'),
          onPress: () => {
            api.removeSigningKey(device.signingKey).then(() => {
              dispatch(removeDevice(device.signingKey));
            });
          },
        },
        {
          text: t('common.alert.no'),
        },
      ],
    );
  };

  const renderItem = ({ item: device, index }) => (
    <View testID={`device-${index}`} style={styles.deviceContainer}>
      <View testID={getName(device)} style={styles.deviceLabelContainer}>
        <View style={styles.deviceNameContainer}>
          <Text style={styles.deviceNameText}>{getName(device)}</Text>
          {isCurrentDevice(device) && (
            <Text style={styles.devicePrimaryText}>
              &nbsp;({isPrimary ? 'Primary' : 'Secondary'})
            </Text>
          )}
        </View>
        <View style={styles.deviceSigningKeyContainer}>
          <Text style={styles.deviceSigningKeyText}>
            {shortenSigningKey(device.signingKey)}
          </Text>
        </View>
      </View>
      {!isCurrentDevice(device) && (
        <View style={styles.removeBtnContainer}>
          <TouchableOpacity
            style={styles.removeBtn}
            testID={`RemoveDeviceBtn-${index}`}
            onPress={() => remove(device)}
          >
            <Material
              name="delete"
              size={DEVICE_LARGE ? 22 : 20}
              color={BLUE}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <ScrollView style={styles.container} testID="DevicesScreen">
        <View style={styles.devicesContainer}>
          <Text style={styles.description}>
            {t('devices.text.listDescription')}
          </Text>
          <FlatList
            data={devices}
            renderItem={renderItem}
            keyExtractor={(item) => item.signingKey}
          />
          {waiting ? (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingMessage}>
                {t('devices.text.waitSyncing')}
              </Text>
              <Spinner
                isVisible={waiting}
                size={DEVICE_LARGE ? 48 : 42}
                type="Wave"
                color={BLUE}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.syncBtn}
              testID="SyncBtn"
              onPress={sync}
            >
              <View style={styles.syncBtnContainer}>
                <Material
                  name="sync"
                  size={DEVICE_LARGE ? 22 : 20}
                  color={WHITE}
                />
                <Text style={styles.syncText}>Sync Devices</Text>
              </View>
            </TouchableOpacity>
          )}
          <View style={styles.primaryDeviceSwitchContainer}>
            <Text
              style={styles.primaryDeviceSwitchLabel}
              onPress={() => {
                dispatch(setPrimaryDevice(!isPrimary));
              }}
            >
              {t('devices.text.switchPrimaryLabel')}
            </Text>
            <CheckBox
              style={styles.primaryDeviceSwitch}
              tintColors={{ false: GREY, true: ORANGE }}
              onValueChange={(value) => {
                dispatch(setPrimaryDevice(value));
              }}
              value={isPrimary}
            />
          </View>
          <Text style={styles.infoText}>
            <Text style={styles.noticeText}>{t('devices.text.notice')}</Text>
            {t('devices.text.primaryDeviceNotice')}
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 2,
  },
  devicesContainer: {
    padding: 30,
  },
  deviceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 10,
  },
  deviceLabelContainer: {
    flexDirection: 'column',
    flex: 10,
    alignItems: 'flex-start',
  },
  deviceNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  deviceSigningKeyContainer: {},
  removeBtnContainer: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
  },
  deviceNameText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  devicePrimaryText: {
    fontFamily: 'Poppins-Medium',
    fontWeight: 'bold',
    fontSize: fontSize[16],
    color: BLACK,
  },
  deviceSigningKeyText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLUE,
  },
  description: {
    fontSize: fontSize[16],
    padding: 10,
    marginBottom: 20,
  },
  syncBtn: {
    // flex: 1,
  },
  removeBtn: {},
  syncBtnContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    borderRadius: 10,
    backgroundColor: BLUE,
    padding: 10,
    marginTop: 30,
  },
  syncText: {
    color: WHITE,
    fontFamily: 'Poppins-Bold',
    paddingLeft: 10,
    fontSize: fontSize[14],
  },
  waitingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 20,
  },
  waitingMessage: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[14],
    color: BLUE,
  },
  primaryDeviceSwitchContainer: {
    marginTop: DEVICE_LARGE ? 10 : 8,
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  primaryDeviceSwitchLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARK_ORANGE,
  },
  primaryDeviceSwitch: {
    flex: 1,
  },
  noticeText: {
    fontSize: fontSize[13],
    color: RED,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
});

export default DevicesScreen;
