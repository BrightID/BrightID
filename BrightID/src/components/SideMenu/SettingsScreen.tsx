import React, { useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/elements';
import { Picker } from '@react-native-picker/picker';
import i18next from 'i18next';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { BLUE, DARK_ORANGE, LIGHT_GREY, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { translations } from '@/i18n';
import { setLanguageTag } from '@/reducer/settingsSlice';
import { useDispatch, useSelector } from '@/store/hooks';
import { leaveAllChannels } from '@/components/PendingConnections/actions/channelThunks';
import { selectTotalChannels } from '@/components/PendingConnections/channelSlice';
import { clearRecoveryChannel } from '@/components/Onboarding/RecoveryFlow/thunks/channelThunks';
import {
  resetRecoveryData,
  selectRecoveryData,
} from '@/components/Onboarding/RecoveryFlow/recoveryDataSlice';
import { LogFileScreen } from '@/components/SideMenu/LogFileScreen';

export const SettingsScreen = () => {
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const { t } = useTranslation();
  const languageTag = i18next.resolvedLanguage;
  const dispatch = useDispatch();
  const numChannels = useSelector(selectTotalChannels);
  const { channel, id } = useSelector(selectRecoveryData);
  const [produceError, setProduceError] = useState(false);
  const [showLogs, setShowLogs] = useState<boolean>(false);

  const setLanguageHandler = async (itemValue, _itemIndex) => {
    await i18next.changeLanguage(itemValue);
    const currentLanguage = i18next.resolvedLanguage;
    if (currentLanguage === itemValue) {
      console.log(`New language: ${currentLanguage}`);
      dispatch(setLanguageTag(itemValue));
    } else {
      console.log(
        `Failed to set language ${itemValue}. Resolved language: ${currentLanguage}`,
      );
    }
  };

  const availableLanguages = Object.keys(translations)
    .sort((a, b) =>
      translations[a].nativeLabel < translations[b].nativeLabel ? -1 : 1,
    )
    .map((key) => (
      <Picker.Item
        label={translations[key].nativeLabel}
        value={key}
        key={key}
      />
    ));

  const handleCloseLogs = () => {
    setShowLogs(false);
  };

  if (showLogs) {
    return (
      <View
        style={[styles.logfileScreenContainer, { marginTop: headerHeight }]}
      >
        <LogFileScreen handleClose={handleCloseLogs} />
      </View>
    );
  }

  return (
    <ScrollView>
      <View
        style={[styles.container, { marginTop: headerHeight }]}
        testID="SettingsScreen"
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>
            <Text>{t('drawer.label.settings', 'Settings')}</Text>
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.settingsItemContainer}>
          <Text style={styles.label}>
            {t('settings.language.label', 'Language')}
          </Text>
          <Picker
            selectedValue={languageTag}
            onValueChange={setLanguageHandler}
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
          >
            {availableLanguages}
          </Picker>
        </View>
        <View style={styles.divider} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Debug Settings</Text>
        </View>
        <Text>
          These settings are for troubleshooting/debugging. Usually you should
          not need to modify anything here.
        </Text>
        <View style={styles.settingsItemContainer}>
          <Text style={styles.label}>Connection channels</Text>
          <View style={styles.debugSettingContainer}>
            <Text>Open channels: {numChannels}</Text>
            <TouchableOpacity
              disabled={numChannels === 0}
              style={styles.button}
              onPress={() => dispatch(leaveAllChannels())}
            >
              <Text style={styles.buttonText}>close open channels</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingsItemContainer}>
          <Text style={styles.label}>Recovery data</Text>
          <View style={styles.debugSettingContainer}>
            <Text>Recovery channel id: {channel.channelId || 'none'}</Text>
            <Text>Recover data id: {id || 'none'}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                dispatch(clearRecoveryChannel());
                dispatch(resetRecoveryData());
              }}
            >
              <Text style={styles.buttonText}>close recovery/sync channel</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.settingsItemContainer}>
          <Text style={styles.label}>Logfiles</Text>
          <View style={[styles.debugSettingContainer]}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setShowLogs(true);
              }}
            >
              <Text style={styles.buttonText}>Access logfiles</Text>
            </TouchableOpacity>
          </View>
        </View>
        {__DEV__ && (
          <View style={styles.settingsItemContainer}>
            <Text style={styles.label}>Error Boundary</Text>
            <View style={styles.debugSettingContainer}>
              <Text>Test error boundary</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setProduceError(true);
                }}
              >
                <Text style={styles.buttonText}>make an error</Text>
              </TouchableOpacity>
              {produceError && (
                <Text>
                  {
                    // @ts-ignore This is for testing error boundary screen
                    something_undefined.length
                  }
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingHorizontal: DEVICE_LARGE ? 40 : 30,
  },
  headerTextContainer: {
    marginTop: DEVICE_LARGE ? 20 : 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[20],
    color: BLUE,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: DARK_ORANGE,
  },
  settingsItemContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 12 : 8,
  },
  pickerStyle: {},
  pickerItemStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
  },
  divider: {
    width: '100%',
    borderBottomColor: LIGHT_GREY,
    borderBottomWidth: 1,
    marginTop: DEVICE_LARGE ? 16 : 12,
  },
  debugSettingContainer: {
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 36 : 28,
    backgroundColor: ORANGE,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    width: DEVICE_LARGE ? 240 : 200,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
    marginLeft: 10,
  },
  logfileScreenContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    bottom: 0,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
