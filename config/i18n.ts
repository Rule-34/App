/**
 * Locale definitions. Single source of truth for @nuxtjs/i18n config
 * and runtime composables (flag display, locale codes, etc.).
 */
export const locales = [
  { code: 'en', language: 'en-US', name: 'English', file: 'en.json', flag: '🇺🇸' },
  { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json', flag: '🇷🇺' },
  { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json', flag: '🇪🇸' },
  { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json', flag: '🇯🇵' },
  { code: 'pt', language: 'pt-BR', name: 'Português', file: 'pt.json', flag: '🇧🇷' },
  { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json', flag: '🇩🇪' },
  { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json', flag: '🇫🇷' },
  { code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh.json', flag: '🇨🇳' },
  { code: 'ko', language: 'ko-KR', name: '한국어', file: 'ko.json', flag: '🇰🇷' },
  { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json', flag: '🇮🇩' },
  { code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json', flag: '🇹🇷' },
  { code: 'it', language: 'it-IT', name: 'Italiano', file: 'it.json', flag: '🇮🇹' },
  { code: 'vi', language: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json', flag: '🇻🇳' }
] as const

/** Retired locale URL prefixes — kept for permanent 301 redirects (SEO). */
export const removedLocaleCodes = ['hi', 'fil', 'pl', 'th'] as const

export const defaultLocale = 'en' as const

export type LocaleCode = (typeof locales)[number]['code']

export const prefixedLocaleCodes = locales.filter((l) => l.code !== defaultLocale).map((l) => l.code)

export const localeCodes = new Set<string>(locales.map((l) => l.code))
