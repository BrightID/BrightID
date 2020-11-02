// @flow

import React from 'react';
import { useTranslation } from 'react-i18next';
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
