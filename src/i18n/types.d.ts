import i18next from 'i18next';

declare global {
  interface Window {
    i18n?: typeof i18next;
  }
} 