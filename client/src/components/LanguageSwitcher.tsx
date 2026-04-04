import { useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'ru' : 'en')}
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '6px',
        color: '#fff',
        padding: '4px 10px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontWeight: 600,
      }}
      title={locale === 'en' ? 'Переключить на русский' : 'Switch to English'}
    >
      {locale === 'en' ? 'RU' : 'EN'}
    </button>
  );
}
