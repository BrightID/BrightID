import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import i18next from 'i18next';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { BLUE, DARK_ORANGE, LIGHT_GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { translations } from '@/i18n';
import { selectLanguageTag, setLanguageTag } from '@/reducer/settingsSlice';
import { useDispatch, useSelector } from '@/store';

export const SettingsScreen = () => {
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const { t } = useTranslation();
  const languageTag = useSelector(selectLanguageTag);
  const dispatch = useDispatch();

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

  return (
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
      <View style={styles.setLanguageContainer}>
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
    </View>
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
  setLanguageContainer: {
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
});
