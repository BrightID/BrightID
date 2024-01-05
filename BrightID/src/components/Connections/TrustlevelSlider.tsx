import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';
import { connection_levels } from '@/utils/constants';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { BLACK, ORANGE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import {
  getConnectionLevelColor,
  getConnectionLevelString,
} from '@/utils/connectionLevelStrings';

type TrustlevelSliderProps = {
  currentLevel: ConnectionLevel;
  incomingLevel: ConnectionLevel;
  changeLevelHandler: (newLevel: ConnectionLevel) => any;
  verbose: boolean;
};

const TrustlevelSlider = ({
  currentLevel,
  incomingLevel,
  changeLevelHandler,
  verbose,
}: TrustlevelSliderProps) => {
  const { t } = useTranslation();
  const includeRecovery = Array<ConnectionLevel>(
    connection_levels.ALREADY_KNOWN,
    connection_levels.RECOVERY,
  ).includes(incomingLevel);

  const levelsWithoutRecovery = {
    [connection_levels.SUSPICIOUS]: {
      description: t('connectionDetails.text.levelSuspicious'),
    },
    [connection_levels.JUST_MET]: {
      description: t('connectionDetails.text.levelJustMet'),
    },
    [connection_levels.ALREADY_KNOWN]: {
      description: t('connectionDetails.text.levelAlreadyKnown'),
    },
  };

  const levelsWithRecovery = {
    ...levelsWithoutRecovery,
    [connection_levels.RECOVERY]: {
      description: t('connectionDetails.text.levelRecovery'),
    },
  };

  const trustLevelDetails = includeRecovery
    ? levelsWithRecovery
    : levelsWithoutRecovery;
  const minValue = 0;
  const maxValue = Object.keys(trustLevelDetails).length - 1;

  // TODO - Quick workaround to catch connections that just changed from "REPORTED" to something else, but are not
  // confirmed on the backend yet. This can happen when you report someone and later reconnect. Proper solution is
  // to not allow changing level again until the last operation actually confirmed.
  // RESPONSE: The connection slider will not be avail for users who are marked as REPORTED, because we are no longer deleting reported connections, but I will keep this here in case we run into this issue in the future
  if (currentLevel === connection_levels.REPORTED) {
    currentLevel = connection_levels.SUSPICIOUS;
  }

  // map connectionLevel to index value
  let initialValue = Object.keys(trustLevelDetails).indexOf(currentLevel);
  // fixes error where component crashes in some cases
  if (initialValue === -1) initialValue = 1;

  const valueChangeHandler = (value: number) => {
    console.log(`Slider value: ${value}`);
    // map index value back to connectionLevel
    changeLevelHandler(
      Object.keys(trustLevelDetails)[value] as ConnectionLevel,
    );
  };

  return (
    <View style={styles.container} testID="ConnectionLevelSliderPopup">
      <View style={styles.label}>
        <Text
          testID="ConnectionLevelSliderText"
          style={[
            styles.labelText,
            { color: getConnectionLevelColor(currentLevel) },
          ]}
        >
          {getConnectionLevelString(currentLevel)}
        </Text>
      </View>
      {verbose && (
        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            "{trustLevelDetails[currentLevel]?.description}"
          </Text>
        </View>
      )}
      <Slider
        testID="ConnectionLevelSlider"
        style={styles.slider}
        value={initialValue}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={1}
        minimumTrackTintColor={getConnectionLevelColor(
          connection_levels.RECOVERY,
        )}
        maximumTrackTintColor={getConnectionLevelColor(
          connection_levels.REPORTED,
        )}
        thumbTintColor={ORANGE}
        onValueChange={valueChangeHandler}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginBottom: DEVICE_LARGE ? 10 : 8,
  },
  labelText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[17],
    color: BLACK,
  },
  description: {
    // set minimum height so the slider does not jump when the description
    // text changes between 1 and 2 lines
    minHeight: 50,
    marginBottom: DEVICE_LARGE ? 10 : 5,
  },
  descriptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: BLACK,
    textAlign: 'center',
  },
  slider: {
    marginBottom: DEVICE_LARGE ? 13 : 11,
    // slider only supports absolute width, so have to calculate manually:
    // width = deviceWidth * modalWidth (90%) * sliderWidth (80% of modal width)
    width: WIDTH * 0.9 * 0.8,
    height: DEVICE_LARGE ? 50 : 45,
  },
});

export default TrustlevelSlider;
