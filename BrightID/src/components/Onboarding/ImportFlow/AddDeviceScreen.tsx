import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { BLACK, DARKER_GREY, ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  addDevice,
  addOperation,
  selectIsPrimaryDevice,
  selectOperationByHash,
  setPrimaryDevice,
} from '@/actions';
import ChannelAPI from '@/api/channelService';
import { uploadAllInfoAfter } from './thunks/channelUploadThunks';
import { useNodeApiContext } from '@/context/NodeApiContext';
import { operation_states } from '@/utils/constants';
import { AddSigningKey } from '@/components/Onboarding/ImportFlow/AddSigningKey';
import { UploadData } from '@/components/Onboarding/ImportFlow/UploadData';
import { loadRecoveryData } from '@/utils/recovery';
import { useDispatch, useSelector } from '@/store/hooks';
import { resetRecoveryData } from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';

/**
 * Screen for adding a new device
 */

export enum AddSigningKeySteps {
  WAITING, // not yet started
  DOWNLOADING, // open channel and download signing key data from other device/client
  WAITING_OPERATION, // Op to add signing key submitted to backend but not yet applied
  OPERATION_APPLIED, // op successfully applied in backend
  ERROR,
}

export enum UploadDataSteps {
  WAITING, // upload not yet started
  UPLOADING, // upload of data in progress
  COMPLETE, // all data uploaded
  ERROR,
}

const AddDeviceScreen = ({ route }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const url = useSelector((state) => state.recoveryData.channel?.url);
  const aesKey = useSelector((state) => state.recoveryData.aesKey);
  const [deviceName, setDeviceName] = useState('');
  const [signingKey, setSigningKey] = useState('');
  const { api } = useNodeApiContext();
  const [addSigningKeyOpHash, setSigningKeyOpHash] = useState<string>('');
  const [addSigningKeyError, setAddSigningKeyError] = useState('');
  const addSigningKeyOp = useSelector((state) =>
    selectOperationByHash(state, addSigningKeyOpHash),
  );
  const [addSigningKeyStep, setAddSigningKeyStep] = useState(
    AddSigningKeySteps.WAITING,
  );
  const [uploadDataStep, setUploadDataStep] = useState(UploadDataSteps.WAITING);
  const [uploadDataError, setUploadDataError] = useState('');

  const isPrimary = useSelector(selectIsPrimaryDevice);
  const isSuper = route.params.isSuper === true;
  const changePrimaryDevice =
    !isSuper && isPrimary && route.params.changePrimaryDevice;
  const name = route.params.name || 'Unknown App';

  useEffect(() => {
    if (isSuper && name) {
      setDeviceName(name);
    }
  }, [name, isSuper]);

  const handleSubmit = async () => {
    try {
      setAddSigningKeyStep(AddSigningKeySteps.DOWNLOADING);
      const channelApi = new ChannelAPI(url.href);
      const { signingKey } = await loadRecoveryData(channelApi, aesKey);
      console.log(`adding new signing key`);
      setSigningKey(signingKey);
      const op = await api.addSigningKey(signingKey);
      dispatch(addOperation(op));
      setSigningKeyOpHash(op.hash);
      setAddSigningKeyStep(AddSigningKeySteps.WAITING_OPERATION);
    } catch (err) {
      console.log(`Error setting signing key: ${err.message}`);
      setAddSigningKeyStep(AddSigningKeySteps.ERROR);
      setAddSigningKeyError(err.message);
    }
  };

  // start data upload as soon as signing keys have been added
  useEffect(() => {
    const runEffect = async () => {
      console.log(`Starting upload of local info`);
      try {
        setUploadDataStep(UploadDataSteps.UPLOADING);
        await dispatch(uploadAllInfoAfter(0, isSuper));
        setUploadDataStep(UploadDataSteps.COMPLETE);
        if (isPrimary) {
          dispatch(setPrimaryDevice(!changePrimaryDevice));
        }
        console.log(`Finished upload of local info`);
      } catch (err) {
        console.log(`Error uploading data: ${err.message}`);
        setUploadDataStep(UploadDataSteps.ERROR);
        setUploadDataError(err.message);
      }
    };
    if (
      addSigningKeyStep === AddSigningKeySteps.OPERATION_APPLIED &&
      uploadDataStep === UploadDataSteps.WAITING
    ) {
      runEffect();
    }
  }, [
    addSigningKeyStep,
    changePrimaryDevice,
    dispatch,
    isPrimary,
    uploadDataStep,
    isSuper,
  ]);

  // track overall progress
  useEffect(() => {
    if (
      addSigningKeyStep === AddSigningKeySteps.OPERATION_APPLIED &&
      uploadDataStep === UploadDataSteps.COMPLETE
    ) {
      console.log(`Completed add device workflow!`);
      // add new device to local storage
      dispatch(addDevice({ name: deviceName, signingKey, active: true }));
      dispatch(resetRecoveryData());
      navigation.navigate('Devices');
    }
  }, [
    addSigningKeyStep,
    deviceName,
    dispatch,
    navigation,
    signingKey,
    uploadDataStep,
  ]);

  // track addSigningKey operation status
  useEffect(() => {
    if (
      addSigningKeyOp &&
      addSigningKeyStep === AddSigningKeySteps.WAITING_OPERATION
    ) {
      switch (addSigningKeyOp.state) {
        case operation_states.UNKNOWN:
        case operation_states.INIT:
        case operation_states.SENT:
          // op being processed. do nothing.
          break;
        case operation_states.APPLIED:
          setAddSigningKeyStep(AddSigningKeySteps.OPERATION_APPLIED);
          setSigningKeyOpHash('');
          break;
        case operation_states.FAILED:
          setAddSigningKeyStep(AddSigningKeySteps.ERROR);
          setAddSigningKeyError('Operation could not be applied');
          setSigningKeyOpHash('');
          break;
        case operation_states.EXPIRED:
          // operation did not get applied within time window. Abort and show error.
          setAddSigningKeyStep(AddSigningKeySteps.ERROR);
          setAddSigningKeyError('Operation timed out');
          setSigningKeyOpHash('');
          break;
        default:
          setAddSigningKeyStep(AddSigningKeySteps.ERROR);
          setAddSigningKeyError('Unhandled operation state');
          setSigningKeyOpHash('');
      }
    }
  }, [addSigningKeyOp, addSigningKeyStep]);

  useEffect(() => {
    const showConfirmDialog = () => {
      return Alert.alert(
        t('common.alert.title.pleaseConfirm'),
        isSuper
          ? t('devices.alert.addSuperApp', { name })
          : changePrimaryDevice
          ? t('devices.alert.confirmAddPrimary')
          : t('devices.alert.confirmAdd'),
        [
          {
            text: t('common.alert.yes'),
            onPress: () => {
              resetFlow();
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
    showConfirmDialog();
  }, []);

  const resetFlow = () => {
    setAddSigningKeyStep(AddSigningKeySteps.WAITING);
    setUploadDataStep(UploadDataSteps.WAITING);
    setAddSigningKeyError('');
    setUploadDataError('');
  };

  const submitEnabled =
    deviceName.length >= 3 &&
    addSigningKeyStep === AddSigningKeySteps.WAITING &&
    uploadDataStep === UploadDataSteps.WAITING;

  const pendingSubmit =
    addSigningKeyStep === AddSigningKeySteps.WAITING &&
    uploadDataStep === UploadDataSteps.WAITING;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="AddDeviceScreen">
        {pendingSubmit && (
          <>
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
              <TouchableOpacity
                style={[styles.submitBtn, { opacity: submitEnabled ? 1 : 0.7 }]}
                onPress={handleSubmit}
                accessibilityLabel={t('devices.button.submit')}
                disabled={!submitEnabled}
                testID="submitDeviceName"
              >
                <Text style={styles.submitBtnText}>
                  {t('devices.button.submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <View style={styles.progressContainer}>
          {addSigningKeyStep !== AddSigningKeySteps.WAITING && (
            <>
              <View style={styles.addSigningKeyContainer}>
                <AddSigningKey
                  currentStep={addSigningKeyStep}
                  errorMessage={addSigningKeyError}
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.uploadDataContainer}>
                <UploadData
                  currentStep={uploadDataStep}
                  errorMessage={uploadDataError}
                />
              </View>
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
    flex: 0.5,
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
  addSigningKeyContainer: {
    // marginTop: DEVICE_LARGE ? 25 : 20,
    // minHeight: '25%',
  },
  uploadDataContainer: {
    // height: '50%',
  },
  submitContainer: {
    width: '100%',
    alignItems: 'center',
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
  divider: {
    marginTop: DEVICE_LARGE ? 40 : 20,
    marginBottom: DEVICE_LARGE ? 30 : 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BLACK,
  },
  progressContainer: {
    marginTop: DEVICE_LARGE ? 50 : 40,
  },
});

export default AddDeviceScreen;
