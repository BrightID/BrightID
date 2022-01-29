import React, { useState, useEffect, useContext } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, DARKER_GREY, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { addDevice } from '@/actions';
import ChannelAPI from '@/api/channelService';
import { loadRecoveryData } from '../RecoveryFlow/thunks/channelDownloadThunks';
import { uploadAllInfoAfter } from './thunks/channelUploadThunks';
import { NodeApiContext } from '@/components/NodeApiGate';


/* Description */

/* ======================================== */

/**
 * Screen for adding a new device
 */

/* Add Device Screen */

/* ======================================== */
export const AddDeviceScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const url = useSelector((state) => state.recoveryData.channel?.url);
  const aesKey = useSelector((state) => state.recoveryData.aesKey);
  const [deviceName, setDeviceName] = useState('');
  const [waiting, setWaiting] = useState(false);
  const api = useContext(NodeApiContext);

  const handleSubmit = async () => {
    setWaiting(true);
    const channelApi = new ChannelAPI(url.href);
    const { signingKey } = await loadRecoveryData(channelApi, aesKey);
    await api.addSigningKey(signingKey);
    await uploadAllInfoAfter(0);
    dispatch(addDevice({ name: deviceName, signingKey, active: true }));
    navigation.navigate('Devices');
  };

  const disabled = deviceName.length < 3;

  const showConfirmDialog = () => {
    return Alert.alert(
      t("common.alert.title.pleaseConfirm"),
      t("devices.alert.confirmAdd"),
      [{
        text: t("common.alert.yes"),
      }, {
        text: t("common.alert.no"),
        onPress: () => {
          navigation.navigate("Home");
        },
      }]
    );
  };

  useEffect(() => {
    showConfirmDialog();
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="AddDeviceScreen">
        <View style={styles.descContainer}>
          <Text style={styles.registerText}>
            {t('devices.text.whatsDeviceName')}
          </Text>
        </View>
        <View style={styles.midContainer}>
          <TextInput
            testID="editDeviceName"
            onChangeText={setDeviceName}
            value={deviceName}
            placeholder={t('devices.placeholder.deviceName')}
            placeholderTextColor={DARKER_GREY}
            style={styles.textInput}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
            underlineColorAndroid="transparent"
            blurOnSubmit={true}
          />
        </View>
        <View style={styles.submitContainer}>
          {waiting ? (
            <View style={styles.waitingContainer}>
              <Text>{t('devices.text.waitingForExport')}</Text>
              <Spinner
                isVisible={true}
                size={DEVICE_LARGE ? 64 : 44}
                type="Wave"
                color={ORANGE}
              />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, { opacity: disabled ? 0.7 : 1 }]}
              onPress={handleSubmit}
              accessibilityLabel={t('devices.button.submit')}
              disabled={disabled}
              testID="submitDeviceName"
            >
              <Text style={styles.submitBtnText}>
                {t('devices.button.submit')}
              </Text>
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
  waitingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  descContainer: {
    marginTop: DEVICE_LARGE ? 100 : 85,
  },
  midContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
    color: BLACK,
    borderBottomWidth: 1,
    borderBottomColor: DARKER_GREY,
    width: '60%',
    textAlign: 'center',
    paddingBottom: 10,
  },
  submitContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 180 : 160,
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
});

export default AddDeviceScreen;
