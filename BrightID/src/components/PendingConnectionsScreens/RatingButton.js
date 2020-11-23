// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

type RatingButtonProps = {
  color: string,
  label: string,
  handleClick: () => any,
  testID: string,
};

export const RatingButton = (props: RatingButtonProps) => {
  const { color, label, handleClick, testID } = props;
  return (
    <TouchableOpacity
      style={[styles.rateButton, { borderColor: color }]}
      onPress={handleClick}
      testID={testID}
    >
      <Text style={[styles.rateButtonLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rateButton: {
    borderWidth: 2,
    borderRadius: 100,
    paddingTop: DEVICE_LARGE ? 8 : 7,
    paddingBottom: DEVICE_LARGE ? 8 : 7,
    width: '80%',
  },
  rateButtonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    textAlign: 'center',
  },
});
