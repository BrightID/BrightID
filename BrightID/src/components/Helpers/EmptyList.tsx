import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

type Props = {
  title: string;
  iconType?: string;
};

const EmptyList = ({ title, iconType = 'alert-outline' }: Props) => (
  <View style={styles.emptyContainer} testID="EmptyListView">
    <MaterialDesignIcons
      size={DEVICE_LARGE ? 48 : 38}
      // @ts-ignore
      name={iconType}
      color={GREY}
    />
    <Text style={styles.emptyText}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    height: '100%',
    width: '100%',
  },
  emptyText: {
    fontFamily: 'ApexNew-Medium',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: fontSize[18],
    color: GREY,
  },
});

export default EmptyList;
