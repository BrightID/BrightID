import React, { useMemo, useState, useContext } from 'react';
import { Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Spinner from 'react-native-spinkit';
import { useTranslation } from 'react-i18next';
import { connection_levels } from '@/utils/constants';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import {
  DARK_ORANGE,
  LIGHT_GREY,
  DARKER_GREY,
  WHITE,
  BLACK,
  LIGHT_BLACK,
  GREEN,
  GREY,
  ORANGE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { useDispatch, useSelector } from '@/store';
import {
  setConnectionLevel,
  recoveryConnectionsSelector,
  addOperation,
} from '@/actions';
import { StackScreenProps } from '@react-navigation/stack';
import { NodeApiContext } from '../NodeApiGate';
import connectionsSelector from '@/utils/connectionsSelector';
import { calculateCooldownPeriod } from '@/utils/recovery';

const UploadAnimation = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.uploadAnimationContainer}>
      <Text style={styles.textInfo}>{t('common.text.uploadingData')}</Text>
      <Spinner
        isVisible={true}
        size={DEVICE_LARGE ? 80 : 65}
        type="Wave"
        color={ORANGE}
      />
    </View>
  );
};

type props = StackScreenProps<
  ModalStackParamList,
  'ReplaceAccountConfirmModal'
>;

const ReplaceAccountConfirmModal = (props) => {
  const { navigation, route } = props;
  const { currentAccount, targetAccount } = route.params;

  const { t } = useTranslation();
  const api = useContext(NodeApiContext);
  const dispatch = useDispatch();
  const myId = useSelector((state: State) => state.user.id);
  const connections = useSelector(connectionsSelector);
  const recoveryConnections = useSelector(recoveryConnectionsSelector);

  const [backupInProgress, setBackupInProgress] = useState(false);

  const currentConnection = useMemo(
    () => connections.filter((conn) => conn.id === currentAccount)[0],
    [connections],
  );

  const targetConnection = useMemo(
    () => connections.filter((conn) => conn.id === targetAccount)[0],
    [connections],
  );

  const confirm = async () => {
    // finally close modal
    try {
      // calculate cooldown period
      const cooldownPeriod = calculateCooldownPeriod({ recoveryConnections });

      // apply
      const promises = [];
      promises.push(
        api.addConnection(
          myId,
          currentAccount,
          connection_levels.ALREADY_KNOWN,
          Date.now(),
        ),
      );
      dispatch(
        setConnectionLevel({
          id: currentAccount,
          level: connection_levels.ALREADY_KNOWN,
        }),
      );
      promises.push(
        api.addConnection(
          myId,
          targetAccount,
          connection_levels.RECOVERY,
          Date.now(),
        ),
      );
      dispatch(
        setConnectionLevel({
          id: targetAccount,
          level: connection_levels.RECOVERY,
        }),
      );

      const ops = await Promise.all(promises);
      for (const op of ops) {
        dispatch(addOperation(op));
      }

      // show information of cooldown period
      if (cooldownPeriod > 0) {
        navigation.navigate('RecoveryCooldownInfo', {
          cooldownPeriod: cooldownPeriod,
          successCallback: () => {
            navigation.navigate('Home');
          },
        });
      } else {
        Alert.alert(
          t('common.alert.success'),
          t(
            'backup.alert.text.completed',
            'Social recovery of your BrightID is now enabled',
          ),
        );
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor={BLACK}
      />
      <View style={styles.modalContainer}>
        {backupInProgress ? (
          <UploadAnimation />
        ) : (
          <>
            <Text
              style={{ textAlign: 'center', fontFamily: 'Poppins-Regular' }}
            >
              {`Change ${currentConnection.name} to ${targetConnection.name} as your recovery connections?`}
            </Text>
            <View style={styles.saveContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={confirm}>
                <Text style={styles.saveButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={styles.cancelButtonText}>
                  {t('common.button.cancel')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  photo: {
    width: '100%',
    flex: 1,
  },
  modalContainer: {
    backgroundColor: WHITE,
    width: '75%',
    borderRadius: 25,
    padding: DEVICE_LARGE ? 36 : 30,
  },
  inputGroup: {
    borderBottomColor: LIGHT_GREY,
    borderBottomWidth: 1,
    marginBottom: DEVICE_LARGE ? 12 : 10,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    color: DARK_ORANGE,
    marginBottom: DEVICE_IOS ? (DEVICE_LARGE ? 15 : 13) : 0,
  },
  textInput: {
    fontSize: fontSize[12],
    marginBottom: DEVICE_IOS ? (DEVICE_LARGE ? 10 : 8) : 0,
  },
  saveContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 14 : 12,
  },
  saveButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
  },
  cancelButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARKER_GREY,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
  textInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[16],
    color: LIGHT_BLACK,
    margin: DEVICE_LARGE ? 12 : 10,
  },
  uploadAnimationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default ReplaceAccountConfirmModal;
