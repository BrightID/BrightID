import React, { useState, useContext, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Alert,
} from 'react-native';
import Material from 'react-native-vector-icons/MaterialIcons';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector, useDispatch } from '@/store';
import { selectActiveDevices } from '@/reducer/devicesSlice';
import { fontSize } from '@/theme/fonts';
import { WHITE, ORANGE, BLUE, BLACK } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { NodeApiContext } from '@/components/NodeApiGate';
import { removeDevice, setLastSyncTime } from '@/actions';
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
  const api = useContext(NodeApiContext);
  const devices = useSelector(selectActiveDevices);
  const signingKey = useSelector((state) => state.keypair.publicKey);
  const settings = useSelector((state) => state.settings);
  const syncCompleted = useSelector(uploadCompletedByOtherSide);

  const shortenSigningKey = (s) => `${s.slice(0, 6)}...${s.slice(-6)}`;
  const isCurrentDevice = (d) => d.signingKey === signingKey;
  const getName = (d) =>
    isCurrentDevice(d) ? 'Current device' : d.name || 'Unknown';
  const [waiting, setWaiting] = useState(!!route.params?.syncing);

  useEffect(() => {
    const runEffect = async () => {
      const { isPrimaryDevice, lastSyncTime } = await getOtherSideDeviceInfo();
      if (isPrimaryDevice && settings.isPrimaryDevice) {
        setWaiting(false);
        dispatch(resetRecoveryData());
        return Alert.alert(
          t('common.alert.error'),
          t('devices.alert.bothPrimary'),
        );
      } else if (!isPrimaryDevice && !settings.isPrimaryDevice) {
        setWaiting(false);
        dispatch(resetRecoveryData());
        return Alert.alert(
          t('common.alert.error'),
          t('devices.alert.noPrimary'),
        );
      }
      if (!settings.isPrimaryDevice) {
        await uploadDeviceInfo();
      }
      const after = settings.isPrimaryDevice
        ? lastSyncTime
        : settings.lastSyncTime;
      await uploadAllInfoAfter(after);
      dispatch(pollImportChannel());
    };
    if (route.params?.asScanner) {
      runEffect();
    }
  }, [
    dispatch,
    route.params?.asScanner,
    settings.isPrimaryDevice,
    settings.lastSyncTime,
    t,
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
      if (!settings.isPrimaryDevice) {
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
      <View testID={getName(device)} style={styles.deviceLabel}>
        <Text style={styles.deviceName}>{getName(device)}</Text>
        <Text style={styles.deviceSigningKey}>
          {shortenSigningKey(device.signingKey)}
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      {!isCurrentDevice(device) && (
        <TouchableOpacity
          style={styles.removeBtn}
          testID={`RemoveDeviceBtn-${index}`}
          onPress={() => remove(device)}
        >
          <Material name="delete" size={DEVICE_LARGE ? 22 : 20} color={BLUE} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="DevicesScreen">
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
    alignItems: 'center',
    padding: 10,
  },
  deviceName: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  deviceSigningKey: {
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
  deviceLabel: {},
});

export default DevicesScreen;
