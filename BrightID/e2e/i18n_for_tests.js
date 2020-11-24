import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import * as englishTranslation from '../translations/english.json';
import * as frenchTranslation from '../translations/french.json';

/*
  This is mostly a copy of /i18n.js, but without dependency on react-native-localize. This way it is possible
  to use i18n in tests specs for tests that rely on localized strings.
 */

const translations = {
  en: {
    translation: englishTranslation,
  },
  fr: {
    translation: frenchTranslation,
  },
};

const defaultLanguage = {
  languageTag: 'en-US',
  isRTL: false,
};

const { languageTag } = defaultLanguage;

i18n.use(initReactI18next).init({
  resources: translations,
  lng: languageTag,
  fallbackLng: 'en',
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
