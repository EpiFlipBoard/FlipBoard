import { useTranslation } from 'react-i18next'

function Statistics() {
  const { t } = useTranslation()
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-gray-900 dark:text-white text-2xl font-extrabold">{t('statistics.no_data')}</div>
    </div>
  )
}

export default Statistics
