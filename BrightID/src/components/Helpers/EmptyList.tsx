import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';

type Props = {
  title: string;
  iconType?: string;
};

const EmptyList = ({ title, iconType = 'alert-outline' }: Props) => (
  <View style={styles.emptyContainer} testID="EmptyListView">
    <MaterialCommunityIcons
      size={DEVICE_LARGE ? 48 : 38}
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
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: fontSize[18],
    color: GREY,
    width: '90%',
  },
});

export default EmptyList;
