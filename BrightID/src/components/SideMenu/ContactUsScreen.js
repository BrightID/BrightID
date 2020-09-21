// @flow

import React, { useCallback, useState, useRef } from 'react';
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Linking,
  Pressable,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { DEVICE_LARGE } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { getExplorerCode } from '@/utils/explorer';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

export const ContactUsScreen = function () {
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
      <Text>Contact Us</Text>
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

  copyCodeContainer: {
    // borderWidth: 1,
    // zIndex: 10,
    flexDirection: 'column',
    width: '80%',
    height: 100,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    width: '100%',
    // overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
    padding: 10,
    color: '#000',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 0,
  },
  setupText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 14 : 13,
  },
  noExplorerCode: {
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 80 : 70,
    paddingHorizontal: DEVICE_LARGE ? 20 : 10,
  },
  alertIcon: {
    marginBottom: DEVICE_LARGE ? 20 : 10,
  },
  infoTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: DEVICE_LARGE ? 100 : 80,
    paddingHorizontal: DEVICE_LARGE ? 20 : 10,
    width: '100%',
  },
  infoText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 14 : 13,
  },
  linkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: 'blue',
    fontSize: DEVICE_LARGE ? 14 : 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'blue',
    margin: 0,
    padding: 0,
  },
  copyText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 14 : 13,
  },
});

export default ContactUsScreen;
