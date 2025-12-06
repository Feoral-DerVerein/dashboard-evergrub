import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './i18n/locales/en.json';
import es from './i18n/locales/es.json';
import ca from './i18n/locales/ca.json';
import de from './i18n/locales/de.json';

const resources = {
    en: { translation: en },
    es: { translation: es },
    ca: { translation: ca },
    de: { translation: de },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'es',
        supportedLngs: ['en', 'es', 'ca', 'de'],
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
            caches: ['localStorage', 'cookie'],
        }
    });

export default i18n;
