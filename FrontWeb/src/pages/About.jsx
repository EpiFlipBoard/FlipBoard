import { useTranslation } from 'react-i18next'

function About() {
  const { t } = useTranslation()
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-bold mb-8">{t('about.title')}</h1>
      <p className="text-xl text-gray-600 dark:text-white/80 mb-6">
        {t('about.intro')}
      </p>
      <div className="prose dark:prose-invert max-w-none">
        <p>
          {t('about.mission')}
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">{t('about.history_title')}</h2>
        <p>
          {t('about.history_body')}
        </p>
      </div>
    </div>
  )
}

export default About