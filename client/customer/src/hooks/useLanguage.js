import { useState, useCallback } from 'react';
import ko from '../i18n/ko.json';
import en from '../i18n/en.json';

const langs = { ko, en };

export function useLanguage() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ko');
  const t = useCallback((key) => langs[lang]?.[key] || key, [lang]);
  const toggle = useCallback(() => {
    const next = lang === 'ko' ? 'en' : 'ko';
    setLang(next);
    localStorage.setItem('lang', next);
  }, [lang]);
  return { lang, t, toggle };
}
