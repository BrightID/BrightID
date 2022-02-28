import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { AddSigningKeySteps } from '@/components/Onboarding/ImportFlow/AddDeviceScreen';

/* Component to track adding of signing key */
type AddSigningKeyParams = {
  currentStep: AddSigningKeySteps;
  errorMessage: string;
};
export const AddSigningKey = ({
  currentStep,
  errorMessage,
}: AddSigningKeyParams) => {
  const [stateDescription, setStateDescription] = useState('');
  const [iconData, setIconData] =
    useState<{ color: string; name: string }>(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    switch (currentStep) {
      case AddSigningKeySteps.WAITING:
      case AddSigningKeySteps.DOWNLOADING:
        setIconData(undefined);
        setStateDescription(
          t(
            'addSigningKey.steps.downloading',
            'Downloading new device data...',
          ),
        );
        break;
      case AddSigningKeySteps.WAITING_OPERATION:
        setIconData(undefined);
        setStateDescription(
          t('addSigningKey.steps.adding', 'Adding signing key...'),
        );
        break;
      case AddSigningKeySteps.OPERATION_APPLIED:
        setIconData({ color: GREEN, name: 'checkmark-circle-outline' });
        setStateDescription(
          t('addSigningKey.steps.complete', 'Signing key added'),
        );
        break;
      case AddSigningKeySteps.ERROR:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        setStateDescription(
          t('addSigningKey.steps.error', 'Adding signing key failed'),
        );
        break;
      default:
        setStateDescription(
          `Unhandled state ${AddSigningKeySteps[currentStep]}`,
        );
        break;
    }
  }, [currentStep, t]);

  if (currentStep === AddSigningKeySteps.WAITING) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          {t('addSigningKey.header.text', {
            defaultValue: 'Add device info',
          })}
        </Text>

        <Text style={styles.headerInfoText}>
          {t('addSigningKey.info', {
            defaultValue: 'Allowing the new device to use your BrightID',
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
          <Text style={styles.infoSubText}>
            {currentStep === AddSigningKeySteps.ERROR ? errorMessage : null}
          </Text>
        </View>
      </View>
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
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 25,
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
  infoSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: BLACK,
  },
});
