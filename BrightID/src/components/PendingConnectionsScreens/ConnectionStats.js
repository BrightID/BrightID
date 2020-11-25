// @flow

import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  return (
    <>
      <View>
        <Text style={styles.countsNumberText}>{numConnections}</Text>
        <Text style={styles.countsDescriptionText}>{t('pendingConnections.label.connections')}</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{numGroups}</Text>
        <Text style={styles.countsDescriptionText}>{t('pendingConnections.label.groups')}</Text>
      </View>
      <View>
        <Text style={styles.countsNumberText}>{numMutualConnections}</Text>
        <Text style={styles.countsDescriptionText}>{t('pendingConnections.label.mutualConnections')}</Text>
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
