import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
import { fontSize } from '@/theme/fonts';
import {
  WHITE,
  BLACK,
  GREEN,
  PRIMARY,
  GRAY10,
  GRAY1,
  GRAY9,
} from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import { qrCodeURL_types } from '@/utils/constants';
import {
  resetRecoveryData,
  selectRecoveryChannel,
} from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { createKeypair } from './SignUpFlow/thunks';
import Close from '../Icons/Close';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { version as app_version } from '../../../package.json';

/* Description */

/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 * Creates Keypair after pressing `Create My BrightID`
 */

/* Onboarding Screen */

/* ======================================== */
export const Onboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const baseUrl = useSelector(selectBaseUrl);
  const channel = useSelector(selectRecoveryChannel);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateMyBrightID = () => {
    dispatch(resetRecoveryData());
    dispatch(createKeypair())
      .then(() => {
        navigation.navigate('SignupName' as never);
      })
      .catch((err) => {
        Alert.alert(err.message);
      });
  };

  const restartRecoveryHandler = () => {
    setModalVisible(false);
    console.log(`Restarting recovery`);
    dispatch(resetRecoveryData());
    navigation.navigate('RecoveryCode', {
      urlType: qrCodeURL_types.RECOVERY,
      action: 'recovery',
    });
  };

  const continueRecoveryHandler = () => {
    setModalVisible(false);
    console.log(`Continue recovery`);
    navigation.navigate('RecoveryCode', {
      urlType: qrCodeURL_types.RECOVERY,
      action: 'recovery',
    });
  };

  const handleRecover = () => {
    if (channel.channelId) {
      // navigation.navigate('RecoverInProgress' as never);
      setModalVisible(true);
    } else {
      navigation.navigate('RecoveryCode', {
        urlType: qrCodeURL_types.RECOVERY,
        action: 'recovery',
      });
    }
    // setModalVisible(true);
  };

  const handleImport = () => {
    navigation.navigate('ImportCode', {
      urlType: qrCodeURL_types.IMPORT,
      action: 'import',
    });
  };

  const handleModalRequestClose = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <>
      <SafeAreaView style={styles.container} testID="OnboardScreen">
        <StatusBar
          barStyle="dark-content"
          backgroundColor={GRAY1}
          animated={true}
        />

        <Modal
          animationType="fade"
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => handleModalRequestClose()}
        >
          <TouchableOpacity
            style={styles.closingModal}
            onPress={() => {
              setModalVisible(false);
            }}
          />

          <View style={styles.modalCenteredView}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeaderContainer}>
                <Text style={styles.modalHeaderText}>
                  Account Recovery Option
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Close />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalText}>
                it looks like you already started the recovery process.
              </Text>

              <View style={styles.modalBtnContainer}>
                <TouchableOpacity
                  style={styles.modalLeftBtn}
                  onPress={restartRecoveryHandler}
                >
                  <Text style={styles.modalLeftBtnText}>Restart</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalRightBtn}
                  onPress={continueRecoveryHandler}
                >
                  <Text style={styles.modalRightBtnText}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.header}>
          <Image
            source={require('@/static/brightid-final.png')}
            accessible={true}
            accessibilityLabel="Home Header Logo"
            resizeMode="contain"
            style={styles.logo}
          />
        </View>

        <View style={styles.center}>
          <Image
            source={require('@/static/iPhone.png')}
            accessible={true}
            accessibilityLabel="Home Header Logo"
            resizeMode="contain"
            style={styles.phone}
          />
        </View>

        <Text style={styles.registerText}>{t('onboarding.text.register')}</Text>

        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={handleCreateMyBrightID}
            accessibilityLabel={t('onboarding.button.create')}
            testID="createBrightID"
          >
            <Text style={styles.createBtnText}>
              {t('onboarding.button.create')}
            </Text>
          </TouchableOpacity>
          <View style={styles.recoverImportContainer}>
            <TouchableOpacity
              style={styles.recoverBtn}
              onPress={handleRecover}
              accessibilityLabel={t('onboarding.button.recover')}
              testID="recoverBrightID"
            >
              <Text style={styles.recoverBtnText}>
                {t('onboarding.button.recover')}
              </Text>
            </TouchableOpacity>
            <View style={styles.space} />
            <TouchableOpacity
              style={styles.recoverBtn}
              onPress={handleImport}
              accessibilityLabel={t('onboarding.button.import')}
              testID="importBrightID"
            >
              <Text style={styles.recoverBtnText}>
                {t('onboarding.button.import')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.versionInfoContainer}>
          <Text style={styles.versionInfo}>
            {baseUrl ? baseUrl.split('://')[1] : 'unknown'} - v{app_version}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  modalHeaderText: {
    marginRight: 30,
    fontFamily: 'Poppins-Medium',
    // fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    fontWeight: '600',
    textAlign: 'center',
    color: GRAY9,
  },
  modalHeaderContainer: {
    flexDirection: 'row',
    // alignContent: 'center'
    // alignItems: 'center'
    justifyContent: 'flex-end',
  },
  modalText: {
    textAlign: 'center',
    color: BLACK,
    fontFamily: 'Poppins-Light',
    fontSize: fontSize[14],
    fontWeight: '400',
  },
  modalBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalRightBtn: {
    width: 136,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    backgroundColor: PRIMARY,
  },
  modalRightBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    fontWeight: '600',
    textAlign: 'center',
    color: WHITE,
  },
  modalLeftBtn: {
    width: 136,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PRIMARY,
    justifyContent: 'center',
  },
  modalLeftBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    fontWeight: '600',
    textAlign: 'center',
    color: PRIMARY,
  },

  closingModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // justifyContent:'center',
  },
  modalCenteredView: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 320,
    height: 236,
    padding: 16,
    borderRadius: 16,
    backgroundColor: GRAY1,
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 2,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '18%',
    // borderWidth: 1,
  },
  logo: {
    maxWidth: '40%',
    maxHeight: 90,
  },
  center: {
    marginTop: 80,
  },
  phone: {
    width: DEVICE_LARGE ? 140 : 130,
    maxHeight: DEVICE_LARGE ? 180 : 165,
  },
  registerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: DEVICE_LARGE ? 26 : 24,
    marginTop: DEVICE_LARGE ? 20 : 18,
  },
  btnContainer: {
    width: '89%',
    // height: 72,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  createBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    // height: DEVICE_LARGE ? 50 : 45,
    height: 52,
    backgroundColor: PRIMARY,
    borderRadius: 16,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  createBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
  space: {
    width: 20,
  },
  recoverBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // height: DEVICE_LARGE ? 50 : 45,
    height: 52,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: PRIMARY,
    borderRadius: 16,
    marginTop: DEVICE_LARGE ? 14 : 12,
  },
  recoverBtnText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: PRIMARY,
  },
  recoverImportContainer: {
    flexDirection: 'row',
  },
  versionInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  versionInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: BLACK,
  },
});

export default Onboard;
