// @flow

import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { fontSize } from '@/theme/fonts';

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
  const { t } = useTranslation();
  return (
    <>
      <View>
        <Text style={styles.countsNumberText}>{connectionsNum}</Text>
        <Text style={styles.countsDescriptionText}>
          {t('pendingConnections.label.connections')}
        </Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{groupsNum}</Text>
        <Text style={styles.countsDescriptionText}>
          {t('pendingConnections.label.groups')}
        </Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{mutualConnectionsNum}</Text>
        <Text style={styles.countsDescriptionText}>
          {t('pendingConnections.label.mutualConnections')}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  countsDescriptionText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[13],
  },
  countsNumberText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: fontSize[16],
  },
});
