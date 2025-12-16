import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files (we will create these next)
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import frTranslation from './locales/fr/translation.json';
import swTranslation from './locales/sw/translation.json';
import deTranslation from './locales/de/translation.json'; // New import
import zhTranslation from './locales/zh/translation.json'; // New import

const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  sw: {
    translation: swTranslation,
  },
  de: { // New language resource
    translation: deTranslation,
  },
  zh: { // New language resource
    translation: zhTranslation,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // default language, use local storage if available
    fallbackLng: 'en', // fallback language if translation is not found
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
