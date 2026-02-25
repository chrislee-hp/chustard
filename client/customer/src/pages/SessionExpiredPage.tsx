import { useI18n } from '../contexts'

export function SessionExpiredPage() {
  const { t } = useI18n()
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
      <h2>{t('sessionExpired')}</h2>
    </div>
  )
}
