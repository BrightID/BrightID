import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHeaderHeight } from '@react-navigation/stack';
import { Picker } from '@react-native-picker/picker';
import i18next from 'i18next';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { translations } from '@/i18n.js';
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
    console.log(`Setting language to ${itemValue}...`);
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

  const availableLanguages = Object.keys(translations).map((key) => (
    <Picker.Item label={translations[key].nativeLabel} value={key} key={key} />
  ));

  return (
    <View
      style={[styles.container, { marginTop: headerHeight }]}
      testID="SettingsScreen"
    >
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoText}>
          <Text>Change language</Text>
        </Text>
      </View>
      <Picker
        selectedValue={languageTag}
        onValueChange={setLanguageHandler}
        style={styles.pickerStyle}
        itemStyle={styles.pickerItemStyle}
      >
        {availableLanguages}
      </Picker>
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
  infoTextContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: DEVICE_LARGE ? 100 : 80,
    paddingHorizontal: DEVICE_LARGE ? 22 : 20,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
  },
  pickerStyle: {
    width: '80%',
  },
  pickerItemStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
  },
});
