// @flow

import React, { useCallback, useState } from 'react';
import { Text, StyleSheet, View, RefreshControl } from 'react-native';
import { DEVICE_LARGE } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';

export const GraphExplorerScreen = function () {
  const headerHeight = useHeaderHeight();
  const isDrawerOpen = useIsDrawerOpen();
  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="graphExplorerScreen"
    >
      <Text>Copy Explorer Code</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});

export default GraphExplorerScreen;
