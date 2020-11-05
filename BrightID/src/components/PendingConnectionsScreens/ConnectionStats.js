// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DEVICE_LARGE } from '../../utils/constants';

type ConnectionStatsProps = {
  numConnections: number,
  numGroups: number,
  numMutualConnections: number,
};

export const ConnectionStats = ({
  numConnections,
  numGroups,
  numMutualConnections,
}: ConnectionStatsProps) => {
  return (
    <>
      <View>
        <Text style={styles.countsNumberText}>{numConnections}</Text>
        <Text style={styles.countsDescriptionText}>Connections</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{numGroups}</Text>
        <Text style={styles.countsDescriptionText}>Groups</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{numMutualConnections}</Text>
        <Text style={styles.countsDescriptionText}>Mutual Connections</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  countsDescriptionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 14 : 12,
  },
  countsNumberText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 17 : 15,
  },
});
