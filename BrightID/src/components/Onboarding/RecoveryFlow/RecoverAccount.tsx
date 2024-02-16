import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AccountSteps } from '@/components/Onboarding/RecoveryFlow/RestoreScreen';
import { fontSize } from '@/theme/fonts';
import { GRAY9, GREEN, ORANGE, RED } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import Spinner from 'react-native-spinkit';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

type RecoverAccountParams = {
  currentStep: AccountSteps;
  errorMessage: string;
  recoveredGroups: number;
  recoveredConnections: number;
};
export const RecoverAccount = ({
  currentStep,
  errorMessage,
  recoveredConnections,
  recoveredGroups,
}: RecoverAccountParams) => {
  const [stateDescription, setStateDescription] = useState('');
  const [iconData, setIconData] =
    useState<{ color: string; name: string }>(undefined);
  const { t } = useTranslation();

  useEffect(() => {
    switch (currentStep) {
      case AccountSteps.WAITING_DOWNLOAD:
      case AccountSteps.DOWNLOAD_COMPLETE:
        setIconData(undefined);
        setStateDescription(
          t(
            'recovery.steps.downloading',
            'Downloading data from recovery connections...',
          ),
        );
        break;
      case AccountSteps.WAITING_OPERATION:
      case AccountSteps.OPERATION_APPLIED:
        setIconData(undefined);
        setStateDescription(
          t('recovery.steps.recovering', 'Recovering account...'),
        );
        break;
      case AccountSteps.COMPLETE:
        setIconData({ color: GREEN, name: 'checkmark-circle-outline' });
        setStateDescription(
          t('recovery.steps.complete', 'Account recovery complete'),
        );
        break;
      case AccountSteps.ERROR:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        setStateDescription(
          t('recovery.steps.error', 'Account recovery failed'),
        );
        break;
      default:
        setStateDescription(`Unhandled state ${AccountSteps[currentStep]}`);
        break;
    }
  }, [currentStep, t]);

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          {t('recovery.header.newText', {
            defaultValue: 'Recover account',
          })}
        </Text>

        <Text style={styles.headerInfoText}>
          {t('recovery.info', {
            defaultValue:
              'This step will recover your BrightID on this device. Names and photos of connections in common with your recovery connections will be restored.',
          })}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={{ marginTop: 20, marginBottom: 20 }}>
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
            {currentStep === AccountSteps.ERROR
              ? errorMessage
              : t('recovery.newState', {
                  defaultValue:
                    '{{recoveredConnections}} Connections Recovered\n{{recoveredGroups}} Groups Recovered',
                  recoveredConnections,
                  recoveredGroups,
                })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  headerTextContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: GRAY9,
    lineHeight: 24,
  },
  headerInfoText: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    color: GRAY9,
    fontSize: fontSize[12],
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'column',
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 10,
  },
  infoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: GRAY9,
    textAlign: 'center',
  },
  infoSubText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[10],
    color: GRAY9,
    textAlign: 'center',
  },
});
