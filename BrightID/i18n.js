import i18n from 'i18next';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

/**
 * For each supported language, import the corresponding language file.
 * Consumed by i18next.
 */
import * as englishTranslation from './locales/en/translation.json';
import * as frenchTranslation from './locales/fr/translation.json';
import * as germanTranslation from './locales/de/translation.json';
import * as spanishTranslation from './locales/es/translation.json';
import * as hindiTranslation from './locales/hi/translation.json';
import * as hansTranslation from './locales/zh_Hans/translation.json';
import * as hantTranslation from './locales/zh_Hant/translation.json';
import * as russianTranslation from './locales/ru/translation.json';

/**
 * For each supported language other than English, import the corresponding moment locale
 * Used for time formatting and things like `fromNow()` ("[...] ago")
 */
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/es';
import 'moment/locale/hi';
import 'moment/locale/zh-cn'; // simplified chinese
import 'moment/locale/zh-tw'; // traditional chinese
import 'moment/locale/ru';

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
  es: {
    translation: spanishTranslation,
  },
  hi: {
    translation: hindiTranslation,
  },
  'zh-Hans': {
    translation: hansTranslation,
  },
  'zh-Hant': {
    translation: hantTranslation,
  },
  ru: {
    translation: russianTranslation,
  },
};

const defaultLanguage = {
  languageTag: 'en-US',
  isRTL: false,
};

const { languageTag } =
  RNLocalize.findBestAvailableLanguage(Object.keys(translations)) ||
  defaultLanguage;

// console.log(RNLocalize.getLocales());
// console.log(`Using languagetag ${languageTag}`);

/**
 * Moment will use detected language throughout the app.
 */
moment.locale(languageTag);

i18n
  .use(initReactI18next) // bind react-i18next to the instance
  .init({
    resources: translations,
    lng: languageTag,
    fallbackLng: 'en',
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
