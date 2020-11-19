// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

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
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 13 : 11.5,
  },
  countsNumberText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
});
