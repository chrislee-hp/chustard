import { useI18n } from '../contexts'

export function LanguageToggle() {
  const { locale, setLocale } = useI18n()
  return (
    <button
      onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
      style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
    >
      {locale === 'ko' ? '🇰🇷' : '🇺🇸'}
    </button>
  )
}
