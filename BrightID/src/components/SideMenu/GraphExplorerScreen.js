// @flow

import React, { useCallback, useState, useRef } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { DEVICE_LARGE } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { getExplorerCode } from '@/utils/explorer';

export const GraphExplorerScreen = function () {
  const headerHeight = useHeaderHeight();
  const isDrawerOpen = useIsDrawerOpen();
  const explorerCode = getExplorerCode();
  const textInputRef = useRef(null);
  const copyText = () => {
    Keyboard.dismiss();
    Clipboard.setString(explorerCode);
  };
  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="graphExplorerScreen"
    >
      <Text style={styles.title}>Explorer Code</Text>
      <View style={styles.copyCodeContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.codeBox}
          editable={true}
          autoFocus={false}
          caretHidden={false}
          allowFontScaling={false}
          selectTextOnFocus={true}
          value={explorerCode}
        />

        <TouchableOpacity style={styles.copyButton} onPress={copyText}>
          <Text>Copy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  title: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    marginTop: '22%',
  },
  copyCodeContainer: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  codeBox: {
    maxWidth: '80%',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 10,
  },
  copyButton: { borderWidth: StyleSheet.hairlineWidth, padding: 10 },
});

export default GraphExplorerScreen;
