import { useLanguage } from '../hooks/useLanguage';

export default function SessionExpiredPage() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t('sessionExpired')}</h1>
      <p>{t('sessionExpiredMsg')}</p>
    </div>
  );
}
