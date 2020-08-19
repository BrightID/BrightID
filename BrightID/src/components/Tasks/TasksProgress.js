// @flow

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

type TasksProgressProps = {
  totalSteps: number,
  currentSteps: number,
  label: string,
};

export const TasksProgress = function ({
  totalSteps,
  currentSteps,
  label,
}: TasksProgressProps) {
  const percentMissing = 100 - (100 / totalSteps) * currentSteps;
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.label}>{`${label}`}</Text>
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
    paddingTop: 20,
    paddingRight: 0,
    paddingBottom: 15,
    paddingLeft: 30,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  label: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    flex: 2,
  },
  progressBar: {
    flex: 4,
    justifyContent: 'flex-end',
  },
  barFilled: {
    height: 16,
    backgroundColor: '#5DEC9A',
    borderRadius: 10,
    width: '100%',
  },
  barCleared: {
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderColor: '#5DEC9A',
    borderWidth: 1,
    alignSelf: 'flex-end',
  },
  steps: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
});
