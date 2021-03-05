import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AccountSteps } from '@/components/Onboarding/RecoveryFlow/RestoreScreen';
import { fontSize } from '@/theme/fonts';
import { BLACK, DARKER_GREY, GREEN, ORANGE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import Spinner from 'react-native-spinkit';
import IonIcons from 'react-native-vector-icons/Ionicons';

/* Component to track account recovery */
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

  useEffect(() => {
    switch (currentStep) {
      case AccountSteps.WAITING_DOWNLOAD:
      case AccountSteps.DOWNLOAD_COMPLETE:
        setStateDescription('Downloading data from recovery connections...');
        break;
      case AccountSteps.RECOVERING_ACCOUNT:
        setStateDescription('Recovering account...');
        break;
      case AccountSteps.COMPLETE:
        setStateDescription('Account recovery complete');
        break;
      case AccountSteps.ERROR:
        setStateDescription('Account recovery failed :-(');
        break;
      default:
        setStateDescription(`Unhandled state ${AccountSteps[currentStep]}`);
        break;
    }
  }, [currentStep]);

  return (
    <View style={styles.container}>
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>Part 1: Recover account</Text>
        <Text style={styles.headerInfoText}>
          This step will recover your BrightID on this device. Names and photos
          of connections in common with your recovery connections will be
          restored.
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={styles.iconContainer}>
          {currentStep === AccountSteps.COMPLETE ? (
            <IonIcons
              style={{ alignSelf: 'center' }}
              size={DEVICE_LARGE ? 64 : 56}
              name="checkmark-circle-outline"
              color={GREEN}
            />
          ) : (
            <Spinner
              isVisible={true}
              size={DEVICE_LARGE ? 64 : 56}
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
              : `Recovered ${recoveredConnections} connections, ${recoveredGroups} groups`}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxWidth: '90%',
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
    textAlign: 'left',
    color: DARKER_GREY,
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
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
