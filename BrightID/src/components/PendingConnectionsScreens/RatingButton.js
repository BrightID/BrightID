// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';

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
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    height: DEVICE_LARGE ? 46 : 42,
  },
  rateButtonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    textAlign: 'center',
  },
});
