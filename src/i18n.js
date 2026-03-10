import { createI18n } from 'vue-i18n'
import kr from './locales/kr.json'
import en from './locales/en.json'

const getDefaultLocale = () => {
  const saved = localStorage.getItem('locale')
  if (saved) return saved
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ko')) return 'kr'
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getDefaultLocale(),
  fallbackLocale: 'kr',
  messages: { kr, en }
})

export default i18n

export const setLocale = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.lang = locale === 'kr' ? 'ko' : 'en'
}

export const getLocale = () => i18n.global.locale.value
