import React from 'react';
import {
  Alert,
  Text,
  StyleSheet,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Clipboard from '@react-native-community/clipboard';
import { useHeaderHeight } from '@react-navigation/elements';
import { useDrawerStatus } from '@react-navigation/drawer';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { BLUE, BLACK, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { getExplorerCode } from '@/utils/explorer';
import { userSelector } from '@/reducer/userSlice';

export const GraphExplorerScreen = function () {
  const { id, password } = useSelector(userSelector);
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }

  const isDrawerOpen = useDrawerStatus();
  const explorerCode = getExplorerCode(id, password);
  const { t } = useTranslation();

  const copyText = () => {
    Clipboard.setString(explorerCode);
    Alert.alert(t('graphExplorer.alert.text.copied'));
  };

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        isDrawerOpen === 'closed' && styles.shadow,
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
              color={BLACK}
            />
            <Text style={styles.copyText}>
              {t('graphExplorer.button.copyCode')}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.noExplorerCode}>
          <Material
            name="boom-gate-alert-outline"
            size={30}
            color={BLACK}
            style={styles.alertIcon}
          />
          <Text style={styles.setupText}>
            {t('graphExplorer.text.backupRequired')}
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
          {t('graphExplorer.text.explorerWebsiteDescription')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
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
    borderBottomColor: BLACK,
    padding: 10,
    color: BLACK,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  setupText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
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
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
  },
  linkText: {
    fontFamily: 'Poppins-Regular',
    color: BLUE,
    fontSize: fontSize[14],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BLUE,
    margin: 0,
    padding: 0,
  },
  copyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
  },
});

export default GraphExplorerScreen;
