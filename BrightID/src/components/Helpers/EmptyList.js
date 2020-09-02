// @flow

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/constants';

type Props = {
  title: string,
  iconType?: string,
};

const EmptyList = ({ title, iconType = 'alert-outline' }: Props) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons
      size={DEVICE_LARGE ? 48 : 38}
      name={iconType}
      color="#ccc"
    />
    <Text style={styles.emptyText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: '100%',
    width: '100%',
  },
  emptyText: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 18 : 15,
    color: '#ccc',
  },
});

export default EmptyList;
