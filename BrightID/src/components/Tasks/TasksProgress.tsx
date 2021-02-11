import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREEN, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

type TasksProgressProps = {
  totalSteps: number;
  currentSteps: number;
  label: string;
};

export const TasksProgress = function({
  totalSteps,
  currentSteps,
  label,
}: TasksProgressProps) {
  const percentMissing = 100 - (100 / totalSteps) * currentSteps;
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.label} adjustsFontSizeToFit={true}>{`${label}`}</Text>
      <View style={styles.progressBar}>
        <View style={styles.barFilled}>
          {percentMissing > 0 ? (
            <View
              style={{ ...styles.barCleared, width: `${percentMissing}%` }}
            />
          ) : null}
        </View>
      </View>
      <Text style={styles.steps}>{`${currentSteps}/${totalSteps}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    paddingTop: DEVICE_LARGE ? 20 : 16,
    paddingRight: 0,
    paddingBottom: DEVICE_LARGE ? 15 : 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontStyle: 'normal',
    fontSize: fontSize[13],
  },
  progressBar: {
    flexGrow: 1,
    marginLeft: DEVICE_LARGE ? 12 : 10,
    marginRight: DEVICE_LARGE ? 12 : 10,
    justifyContent: 'flex-end',
  },
  barFilled: {
    height: DEVICE_LARGE ? 16 : 14,
    backgroundColor: GREEN,
    borderRadius: 10,
    width: '100%',
  },
  barCleared: {
    height: DEVICE_LARGE ? 16 : 14,
    backgroundColor: WHITE,
    borderRadius: 10,
    borderColor: GREEN,
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  steps: {
    fontFamily: 'Poppins-Medium',
    fontStyle: 'normal',
    fontSize: fontSize[14],
  },
});