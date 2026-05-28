import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { defaultLocale, locales } from '../../config/i18n'

const expectedAudienceLocales = ['zh', 'ko', 'id', 'hi', 'tr', 'it', 'pl', 'th', 'vi', 'fil'] as const

type LocaleJson = Record<string, unknown>

function readLocale(locale: string) {
  return JSON.parse(readFileSync(new URL(`../../i18n/locales/${locale}.json`, import.meta.url), 'utf8')) as LocaleJson
}

function flatten(value: unknown, prefix = '', result: Record<string, string> = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    result[prefix] = String(value)
    return result
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, result)
  }

  return result
}

function placeholders(value: string) {
  return Array.from(value.matchAll(/\{[^}]+}/g), ([placeholder]) => placeholder).sort()
}

function getValue(locale: LocaleJson, path: string) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    return (value as Record<string, unknown>)[key]
  }, locale)
}

function linkedKeys(value: string) {
  return Array.from(value.matchAll(/@:\s*([^\s.]+(?:\.[^\s.]+)*)/g), ([, key]) => key)
}

describe('audience locale expansion', () => {
  it('registers the strongest additional locales for the app audience', () => {
    const localeCodes = locales.map((locale) => locale.code)

    expect(localeCodes).toEqual(['en', 'ru', 'es', 'ja', 'pt', 'de', 'fr', ...expectedAudienceLocales])

    expect(localeCodes.filter((code) => code !== defaultLocale)).toHaveLength(16)
  })

  it('ships locale files for each new audience locale', () => {
    for (const locale of expectedAudienceLocales) {
      expect(existsSync(new URL(`../../i18n/locales/${locale}.json`, import.meta.url))).toBe(true)
    }
  })

  it('keeps new locale files aligned with English keys and placeholders', () => {
    const english = flatten(readLocale(defaultLocale))
    const englishKeys = Object.keys(english).sort()

    for (const locale of expectedAudienceLocales) {
      const translated = flatten(readLocale(locale))

      expect(Object.keys(translated).sort()).toEqual(englishKeys)

      for (const key of englishKeys) {
        expect(placeholders(translated[key])).toEqual(placeholders(english[key]))
        expect(translated[key]).not.toMatch(/[<>]/)
      }
    }
  })

  it('uses valid time units in new audience locales', () => {
    expect(readLocale('zh').time).toEqual({
      days: '天',
      hours: '小时',
      minutes: '分钟',
      seconds: '秒'
    })

    expect(readLocale('vi').time).toMatchObject({
      minutes: 'ph'
    })
  })

  it('keeps linked translation keys resolvable in new audience locales', () => {
    for (const locale of expectedAudienceLocales) {
      const messages = readLocale(locale)
      const translated = flatten(messages)

      for (const value of Object.values(translated)) {
        for (const linkedKey of linkedKeys(value)) {
          expect(getValue(messages, linkedKey), `${locale}: ${linkedKey}`).not.toBeUndefined()
        }
      }
    }
  })
})
