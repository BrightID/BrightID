// @flow

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  title: string,
  iconType?: string,
};

const EmptyList = ({ title, iconType = 'alert-outline' }: Props) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons size={48} name={iconType} color="#ccc" />
    <Text style={styles.emptyText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fdfdfd',
    height: '100%',
  },
  emptyText: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: '#ccc',
  },
});

export default EmptyList;
