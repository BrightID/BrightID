// @flow

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';

type ConnectionStatsProps = {
  connectionsNum: number,
  groupsNum: number,
  mutualConnectionsNum: number,
};

export const ConnectionStats = ({
  connectionsNum,
  groupsNum,
  mutualConnectionsNum,
}: ConnectionStatsProps) => {
  return (
    <>
      <View>
        <Text style={styles.countsNumberText}>{connectionsNum}</Text>
        <Text style={styles.countsDescriptionText}>Connections</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{groupsNum}</Text>
        <Text style={styles.countsDescriptionText}>Groups</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{mutualConnectionsNum}</Text>
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
