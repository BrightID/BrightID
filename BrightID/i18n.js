import i18n from 'i18next';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

/**
 * For each supported language, import the corresponding language file.
 * Consumed by i18next.
 */
import * as englishTranslation from './translations/english.json';
import * as frenchTranslation from './translations/french.json';
import * as germanTranslation from './translations/german.json';

/**
 * For each supported language other than English, import the corresponding moment locale
 * Used for time formatting and things like `fromNow()` ("[...] ago")
 */
import 'moment/locale/fr';

/**
 * RNLocalize : Detection of user locale preference and formats (currency, dates, reading direction, ...)
 * i18next : Execution of the translations through the app given specified language preference
 */

const translations = {
  de: {
    translation: germanTranslation,
  },
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

const { languageTag } =
  RNLocalize.findBestAvailableLanguage(Object.keys(translations)) ||
  defaultLanguage;

/**
 * Moment will use detected language throughout the app.
 */
moment.locale(languageTag);

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
