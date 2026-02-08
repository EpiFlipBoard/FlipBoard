import { useTranslation } from 'react-i18next'

function Admin() {
  const { t } = useTranslation()
  return (
    <div className="text-gray-900 dark:text-white">
      <h1 className="text-xl font-semibold mb-4">{t('admin.title')}</h1>
      <p className="text-gray-700 dark:text-gray-300">{t('admin.description')}</p>
    </div>
  )
}

export default Admin