import { useTranslation } from 'react-i18next'

function Help() {
  const { t } = useTranslation()
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-gray-900 dark:text-white">
      <h1 className="text-4xl font-bold mb-8">{t('help.title')}</h1>
      <div className="mb-12">
        <input 
          type="text" 
          placeholder={t('help.search_placeholder')} 
          className="w-full bg-gray-100 dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl px-6 py-4 text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-red placeholder-gray-500 dark:placeholder-white/50"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <HelpCategory title={t('help.categories.getting_started.title')} items={t('help.categories.getting_started.items', { returnObjects: true })} />
        <HelpCategory title={t('help.categories.your_account.title')} items={t('help.categories.your_account.items', { returnObjects: true })} />
        <HelpCategory title={t('help.categories.magazines.title')} items={t('help.categories.magazines.items', { returnObjects: true })} />
      </div>
    </div>
  )
}

function HelpCategory({ title, items }) {
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
      <h3 className="text-xl font-bold mb-4 text-brand-red">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <a href="#" className="text-gray-600 dark:text-white/80 hover:text-gray-900 dark:hover:text-white hover:underline decoration-brand-red underline-offset-4">{item}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Help