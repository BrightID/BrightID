// @flow

import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { getExplorerCode } from '@/utils/explorer';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

export const GraphExplorerScreen = function () {
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const isDrawerOpen = useIsDrawerOpen();
  const explorerCode = getExplorerCode();

  const copyText = () => {
    Clipboard.setString(explorerCode);
    alert('Copied to clipboard!');
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
      {explorerCode ? (
        <TouchableOpacity
          onPressOut={copyText}
          style={styles.copyCodeContainer}
        >
          <View style={styles.codeBox}>
            <Text style={styles.copyText} numberOfLines={1}>
              {explorerCode}
            </Text>
          </View>
          <View style={styles.copyButton}>
            <Material
              name="content-copy"
              size={DEVICE_LARGE ? 28 : 24}
              color="#000"
            />
            <Text style={styles.copyText}> Copy Code</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noExplorerCode}>
          <Material
            name="boom-gate-alert-outline"
            size={30}
            color="#000"
            style={styles.alertIcon}
          />
          <Text style={styles.setupText}>
            Setting up backup and recovery is required to access your graph
            explorer code. Check your notifications or connect to more users to
            be eligible for backup and recovery.
          </Text>
        </View>
      )}
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoText}>
          <Text
            onPress={() => {
              Linking.openURL('https://explorer.brightid.org/');
            }}
            style={styles.linkText}
          >
            https://explorer.brightid.org{' '}
          </Text>
          is a website designed to explore the entire BrightID social graph. Use
          the code above to see your connections in the graph.
        </Text>
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

  copyCodeContainer: {
    flexDirection: 'column',
    width: '80%',
    height: 100,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBox: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'black',
    padding: 10,
    color: '#000',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
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
    paddingHorizontal: DEVICE_LARGE ? 22 : 20,
    // width: '80%',
  },
  infoText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 14 : 13,
  },
  linkText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    color: '#2185D0',
    fontSize: DEVICE_LARGE ? 14 : 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'blue',
    margin: 0,
    padding: 0,
  },
  copyText: {
    // fontFamily: 'Poppins',
    // fontWeight: '400',
    // fontSize: DEVICE_LARGE ? 14 : 13,
  },
});

export default GraphExplorerScreen;
