import { useTranslation } from 'react-i18next'

function Privacy() {
  const { t } = useTranslation()
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-bold mb-8">{t('privacy.title')}</h1>
      <div className="prose dark:prose-invert prose-lg">
        <p className="text-gray-600 dark:text-white/80">{t('privacy.last_updated')}</p>
        
        <h3>{t('privacy.intro_title')}</h3>
        <p>
          {t('privacy.intro_body')}
        </p>

        <h3>{t('privacy.collection_title')}</h3>
        <p>
          {t('privacy.collection_body')}
        </p>

        <h3>{t('privacy.usage_title')}</h3>
        <p>
          {t('privacy.usage_body')}
        </p>
      </div>
    </div>
  )
}

export default Privacy