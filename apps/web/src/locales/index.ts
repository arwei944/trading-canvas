import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './zh.json';
import en from './en.json';

// 获取浏览器语言
const getBrowserLanguage = () => {
  const lang = navigator.language || 'zh';
  return lang.startsWith('zh') ? 'zh' : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en },
    },
    lng: localStorage.getItem('language') || 'zh',
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// 切换语言
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
};

// 获取当前语言
export const getCurrentLanguage = () => i18n.language;
