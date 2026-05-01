/**
 * Locale definitions. Single source of truth for @nuxtjs/i18n config
 * and runtime composables (flag display, locale codes, etc.).
 */
export const locales = [
  { code: 'en', language: 'en', name: 'English', file: 'en.json', flag: '🇺🇸' },
  { code: 'ru', language: 'ru', name: 'Русский', file: 'ru.json', flag: '🇷🇺' },
  { code: 'es', language: 'es', name: 'Español', file: 'es.json', flag: '🇪🇸' },
  { code: 'ja', language: 'ja', name: '日本語', file: 'ja.json', flag: '🇯🇵' }
]

export const defaultLocale = 'en'

export const prefixedLocaleCodes = locales
  .filter((l) => l.code !== defaultLocale)
  .map((l) => l.code)

export const localeCodes = new Set(locales.map((l) => l.code))
