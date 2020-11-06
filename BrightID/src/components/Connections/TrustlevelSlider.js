// @flow

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Slider from '@react-native-community/slider';
import { connection_levels, WIDTH } from '@/utils/constants';
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
    description: 'This person is my friend',
  },
  [connection_levels.RECOVERY]: {
    description: 'This person is a family member',
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
  // map connectionLevel to index value
  const initialValue = Object.keys(trustLevelDetails).indexOf(currentLevel);
  const valueChangeHandler = (value) => {
    console.log(`Slider value: ${value}`);
    // map index value back to connectionLevel
    changeLevelHandler(Object.keys(trustLevelDetails)[value]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.label}>
        <Text
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
        testID="trustLevelSlider"
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
    marginBottom: 5,
  },
  labelText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 17,
    color: '#000',
  },
  description: {},
  descriptionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 17,
    color: '#000',
  },
  slider: {
    marginTop: 20,
    marginBottom: 15,
    // slider only supports absolute width, so have to calculate manually:
    // width = deviceWidth * modalWidth (90%) * sliderWidth (80% of modal width)
    width: WIDTH * 0.9 * 0.8,
    height: 50,
  },
});

export default TrustlevelSlider;
