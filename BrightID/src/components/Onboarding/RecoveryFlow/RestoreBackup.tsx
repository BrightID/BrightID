import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BackupSteps } from '@/components/Onboarding/RecoveryFlow/RestoreScreen';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED, WHITE } from '@/theme/colors';
import { useTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import Spinner from 'react-native-spinkit';
import IonIcons from 'react-native-vector-icons/Ionicons';

/* Component to track backup restore */
type RestoreBackupParams = {
  currentStep: BackupSteps;
  password: string;
  setPassword: (pass: string) => void;
  doRestore: () => void;
  doSkip: () => void;
};
export const RestoreBackup = ({
  currentStep,
  doRestore,
  doSkip,
  password,
  setPassword,
}: RestoreBackupParams) => {
  const [stateDescription, setStateDescription] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [iconData, setIconData] = useState<{ color: string; name: string }>(
    undefined,
  );
  const { t } = useTranslation();

  useEffect(() => {
    switch (currentStep) {
      case BackupSteps.WAITING_ACCOUNT:
        setIconData(undefined);
        setStateDescription(
          t('restore.steps.waitingAccount', 'Waiting for account recovery'),
        );
        setShowPasswordInput(false);
        break;
      case BackupSteps.WAITING_PASSWORD:
        setIconData({ color: DARKER_GREY, name: 'information-circle-outline' });
        setStateDescription(
          t('restore.steps.waitingPassword', 'Enter password or skip'),
        );
        setShowPasswordInput(true);
        break;
      case BackupSteps.RESTORING_DATA:
        setIconData(undefined);
        setStateDescription(t('restore.steps.restoring', 'Restoring data...'));
        setShowPasswordInput(false);
        break;
      case BackupSteps.COMPLETE:
        setIconData({ color: GREEN, name: 'checkmark-circle-outline' });
        setStateDescription(t('restore.steps.complete', 'Restore complete'));
        setShowPasswordInput(false);
        break;
      case BackupSteps.ERROR:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        setStateDescription(
          t('restore.steps.error', 'Restore failed. Wrong password?'),
        );
        setShowPasswordInput(true);
        break;
      case BackupSteps.SKIPPED:
        setIconData({ color: DARKER_GREY, name: 'checkmark-circle-outline' });
        setStateDescription(t('restore.steps.skipped', 'Restore skipped'));
        setShowPasswordInput(false);
        break;
      default:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        setStateDescription(`Unhandled state ${BackupSteps[currentStep]}`);
        break;
    }
  }, [currentStep, t]);

  const submitDisabled = password.length < 1;

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          {t('restore.header.text', {
            defaultValue: 'Part 2: Restore backup (optional)',
          })}
        </Text>
        <Text style={styles.headerInfoText}>
          {t('restore.info', {
            defaultValue:
              'With your backup password you can restore names and photos of all your connections and groups.',
          })}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View>
          {iconData ? (
            <IonIcons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 44}
              name={iconData.name}
              color={iconData.color}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 64 : 44}
              type="Wave"
              color={ORANGE}
            />
          )}
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoText}>{stateDescription}</Text>
        </View>
      </View>
      {showPasswordInput && (
        <View style={styles.actionContainer}>
          <View style={styles.textInputContainer}>
            <TextInput
              onChangeText={setPassword}
              value={password}
              placeholder={t(
                'restore.password.placeholder',
                'Type your password',
              )}
              placeholderTextColor={DARKER_GREY}
              style={styles.textInput}
              autoCorrect={false}
              textContentType="password"
              autoCompleteType="password"
              underlineColorAndroid="transparent"
              secureTextEntry={true}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitDisabled ? { opacity: 0.5 } : {},
              ]}
              onPress={doRestore}
              accessibilityLabel="submit"
              disabled={submitDisabled}
            >
              <Text style={styles.submitText}>
                {t('restore.password.submit', 'Restore')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={doSkip}
              accessibilityLabel="skip"
            >
              <Text style={styles.skipText}>
                {t('restore.password.skip', 'Skip')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    color: BLACK,
  },
  headerInfoText: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: DARKER_GREY,
    fontSize: fontSize[12],
    maxWidth: '90%',
    marginTop: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
  },
  actionContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  textInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: DARKER_GREY,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DARKER_GREY,
    width: '90%',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 20 : 16,
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 120 : 100,
    height: DEVICE_LARGE ? 46 : 40,
    borderRadius: 60,
    backgroundColor: ORANGE,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitText: {
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    fontSize: fontSize[16],
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: ORANGE,
    borderWidth: 1,
    borderRadius: 60,
    width: DEVICE_LARGE ? 120 : 100,
    height: DEVICE_LARGE ? 46 : 40,
    marginLeft: DEVICE_LARGE ? 20 : 16,
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    color: ORANGE,
    fontSize: fontSize[16],
  },
});
