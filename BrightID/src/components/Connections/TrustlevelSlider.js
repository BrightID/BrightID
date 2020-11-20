// @flow

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Slider from '@react-native-community/slider';
import { connection_levels } from '@/utils/constants';
import { WIDTH, DEVICE_LARGE } from '@/utils/deviceConstants';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '@/utils/connectionLevelStrings';

const trustLevelDetails = {
  [connection_levels.SUSPICIOUS]: {
    description: "I don't know this person at all",
  },
  [connection_levels.JUST_MET]: {
    description: 'This person is a stranger I just met',
  },
  [connection_levels.ALREADY_KNOWN]: {
    description: 'I already know this person',
  },
  [connection_levels.RECOVERY]: {
    description: 'I trust this person to recover my BrightID for me',
  },
};

type TrustlevelSliderProps = {
  currentLevel: ConnectionLevel,
  changeLevelHandler: (newLevel: ConnectionLevel) => any,
};

const TrustlevelSlider = ({
  currentLevel,
  changeLevelHandler,
}: TrustlevelSliderProps) => {
  const minValue = 0;
  const maxValue = Object.keys(trustLevelDetails).length - 1;

  // TODO - Quick workaround to catch connections that just changed from "REPORTED" to something else, but are not
  // confirmed on the backend yet. This can happen when you report someone and later reconnect. Proper solution is
  // to not allow changing level again until the last operation actually confirmed.
  if (currentLevel === connection_levels.REPORTED) {
    currentLevel = connection_levels.JUST_MET;
  }

  // map connectionLevel to index value
  const initialValue = Object.keys(trustLevelDetails).indexOf(currentLevel);
  const valueChangeHandler = (value) => {
    console.log(`Slider value: ${value}`);
    // map index value back to connectionLevel
    changeLevelHandler(Object.keys(trustLevelDetails)[value]);
  };

  return (
    <View style={styles.container} testID="ConnectionLevelSliderPopup">
      <View style={styles.label}>
        <Text
          testID="ConnectionLevelSliderText"
          style={[
            styles.labelText,
            { color: connectionLevelColors[currentLevel] },
          ]}
        >
          {connectionLevelStrings[currentLevel]}
        </Text>
      </View>
      <View style={styles.description}>
        <Text style={styles.descriptionText}>
          "{trustLevelDetails[currentLevel].description}"
        </Text>
      </View>
      <Slider
        testID="ConnectionLevelSlider"
        style={styles.slider}
        value={initialValue}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={1}
        minimumTrackTintColor={
          connectionLevelColors[connection_levels.RECOVERY]
        }
        maximumTrackTintColor={
          connectionLevelColors[connection_levels.REPORTED]
        }
        thumbTintColor="orange"
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
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: '#000',
  },
  description: {
    // set minimum height so the slider does not jump when the description
    // text changes between 1 and 2 lines
    minHeight: 50,
  },
  descriptionText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#000',
    textAlign: 'center',
  },
  slider: {
    marginTop: DEVICE_LARGE ? 10 : 5,
    marginBottom: DEVICE_LARGE ? 13 : 11,
    // slider only supports absolute width, so have to calculate manually:
    // width = deviceWidth * modalWidth (90%) * sliderWidth (80% of modal width)
    width: WIDTH * 0.9 * 0.8,
    height: DEVICE_LARGE ? 50 : 45,
  },
});

export default TrustlevelSlider;
