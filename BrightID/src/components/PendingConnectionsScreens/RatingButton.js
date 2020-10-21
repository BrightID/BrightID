/* eslint-disable jsx-a11y/accessible-emoji */
// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { DEVICE_LARGE } from '../../utils/constants';

type RatingButtonProps = {
  level: ConnectionLevel,
  color: 'red' | 'yellow' | 'green',
  label: string,
  handleClick: (...args: Array<any>) => any,
};

export const RatingButton = (props: RatingButtonProps) => {
  const { level, color, label, handleClick } = props;
  return (
    <TouchableOpacity
      style={[styles.rateButton, styles[color]]}
      onPress={() => handleClick(level)}
    >
      <Text style={[styles.rateButtonLabel, styles[color]]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rateButton: {
    borderWidth: 2,
    borderRadius: 100,
    paddingTop: 11,
    paddingBottom: 11,
    width: '100%',
    marginTop: 9,
    marginBottom: 9,
  },
  rateButtonLabel: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 17 : 14,
    textAlign: 'center',
  },
  red: {
    color: '#ED1B24',
    borderColor: '#ED1B24',
  },
  yellow: {
    color: '#FFC918',
    borderColor: '#FFC918',
  },
  green: {
    color: '#4EC580',
    borderColor: '#4EC580',
  },
});
