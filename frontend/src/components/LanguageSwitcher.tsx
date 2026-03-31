import { useLanguage } from '../hooks/useLanguage'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 hidden sm:inline">{t('language')}:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            language === 'en'
              ? 'bg-white text-teal-700 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('english')}
        </button>
        <button
          onClick={() => setLanguage('urdu')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            language === 'urdu'
              ? 'bg-white text-teal-700 shadow-sm font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('urdu')}
        </button>
      </div>
    </div>
  )
}
