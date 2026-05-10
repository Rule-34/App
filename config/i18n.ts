/**
 * Locale definitions. Single source of truth for @nuxtjs/i18n config
 * and runtime composables (flag display, locale codes, etc.).
 */
export const locales = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json', flag: '🇺🇸' },
  { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json', flag: '🇷🇺' },
  { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json', flag: '🇪🇸' },
  { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json', flag: '🇯🇵' }
] as const

export const defaultLocale = 'en' as const

export type LocaleCode = (typeof locales)[number]['code']

export const prefixedLocaleCodes = locales
  .filter((l) => l.code !== defaultLocale)
  .map((l) => l.code)

export const localeCodes = new Set(locales.map((l) => l.code))
