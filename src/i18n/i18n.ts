import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Импортируем переводы
import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';

// Доступные ресурсы
const resources = {
  en: {
    translation: translationEN
  },
  ru: {
    translation: translationRU
  }
};

i18n
  // Использование бэкенда i18next для загрузки переводов по мере необходимости
  .use(Backend)
  // Автоматическое определение языка пользователя
  .use(LanguageDetector)
  // Интеграция с React
  .use(initReactI18next)
  // Инициализация i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // не требуется экранирование в React
    },
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    }
  });

// Добавляем i18n в window для доступа из классовых компонентов
window.i18n = i18n;

export default i18n; 