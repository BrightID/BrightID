import i18n from 'i18next';
import moment from 'moment';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'expo-localization';

/**
 * For each supported language, import the corresponding language file.
 * Consumed by i18next.
 */
import * as englishTranslation from '../locales/en/translation.json';

export const translations = {
  en: {
    translation: englishTranslation,
    nativeLabel: 'English',
  },
};

export const defaultLanguage = {
  languageTag: 'en-US',
  isRTL: false,
};

const { languageTag } =
  // RNLocalize.findBestAvailableLanguage(Object.keys(translations)) ||
  defaultLanguage;

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
