import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Spinner from 'react-native-spinkit';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useTranslation } from 'react-i18next';
import { fontSize } from '@/theme/fonts';
import { BLACK, DARKER_GREY, GREEN, ORANGE, RED } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { UploadDataSteps } from '@/components/Onboarding/ImportFlow/AddDeviceScreen';

/* Component to track adding of signing key */
type UploadDataParams = {
  currentStep: UploadDataSteps;
  errorMessage: string;
};
export const UploadData = ({ currentStep, errorMessage }: UploadDataParams) => {
  const [stateDescription, setStateDescription] = useState('');
  const [iconData, setIconData] = useState<{ color: string; name: string }>(
    undefined,
  );
  const { t } = useTranslation();

  useEffect(() => {
    switch (currentStep) {
      case UploadDataSteps.WAITING:
        setIconData(undefined);
        setStateDescription(
          t('uploadData.steps.waiting', 'Waiting for Signing keys...'),
        );
        break;
      case UploadDataSteps.UPLOADING:
        setIconData(undefined);
        setStateDescription(
          t('uploadData.steps.downloading', 'Uploading user data...'),
        );
        break;
      case UploadDataSteps.COMPLETE:
        setIconData({ color: GREEN, name: 'checkmark-circle-outline' });
        setStateDescription(t('uploadData.steps.complete', 'Upload complete.'));
        break;
      case UploadDataSteps.ERROR:
        setIconData({ color: RED, name: 'alert-circle-outline' });
        setStateDescription(t('uploadData.steps.error', 'Upload data failed'));
        break;
      default:
        setStateDescription(`Unhandled state ${UploadDataSteps[currentStep]}`);
        break;
    }
  }, [currentStep, t]);

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>
          {t('uploadData.header.text', {
            defaultValue: 'Upload user data',
          })}
        </Text>

        <Text style={styles.headerInfoText}>
          {t('uploadData.info', {
            defaultValue:
              'Uploading user data (connections, linked apps, ...) to the new device',
          })}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View>
          {iconData ? (
            <Ionicons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 44}
              // @ts-ignore
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
            {currentStep === UploadDataSteps.ERROR ? errorMessage : null}
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
