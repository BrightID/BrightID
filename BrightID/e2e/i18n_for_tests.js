import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import moment from 'moment';

import * as englishTranslation from '../locales/en/translation.json';

/*
  This is mostly a copy of /i18n.js, but without dependency on react-native-localize. This way it is possible
  to use i18n in tests specs for tests that rely on localized strings.
 */

const translations = {
  en: {
    translation: englishTranslation,
  },
};

const defaultLanguage = {
  languageTag: 'en-US',
  isRTL: false,
};

const { languageTag } = defaultLanguage;

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
  });

export default i18n;
