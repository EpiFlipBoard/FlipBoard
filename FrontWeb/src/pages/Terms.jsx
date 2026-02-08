import { useTranslation } from 'react-i18next'

function Terms() {
  const { t } = useTranslation()
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-bold mb-8">{t('terms.title')}</h1>
      <div className="prose dark:prose-invert prose-lg">
        <p className="text-gray-600 dark:text-white/80">{t('terms.effective_date')}</p>
        
        <h3>{t('terms.acceptance_title')}</h3>
        <p>
          {t('terms.acceptance_body')}
        </p>

        <h3>{t('terms.usage_title')}</h3>
        <p>
          {t('terms.usage_body')}
        </p>

        <h3>{t('terms.ip_title')}</h3>
        <p>
          {t('terms.ip_body')}
        </p>
      </div>
    </div>
  )
}

export default Terms