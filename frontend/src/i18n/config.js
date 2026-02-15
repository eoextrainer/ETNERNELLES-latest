import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';

const europeanLanguages = [
  'fr', 'en', 'de', 'es', 'it', 'pt', 'nl', 'pl', 'sv', 'da', 'fi', 'no',
  'cs', 'sk', 'hu', 'ro', 'bg', 'el', 'hr', 'sl', 'et', 'lv', 'lt', 'ga', 'mt'
];

const buildResources = () => europeanLanguages.reduce((acc, lng) => {
  acc[lng] = { translation: frTranslations };
  return acc;
}, {
  fr: { translation: frTranslations },
  en: { translation: enTranslations }
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    resources: buildResources(),
    supportedLngs: europeanLanguages,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
