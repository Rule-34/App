import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { defaultLocale, locales, prefixedLocaleCodes } from '../../config/i18n'

const nonDefaultLocales = prefixedLocaleCodes

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
  return Array.from(new Set(Array.from(value.matchAll(/\{[^}]+}/g), ([placeholder]) => placeholder))).sort()
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
  it('ships locale files for each registered locale', () => {
    for (const locale of locales.map((locale) => locale.code)) {
      expect(existsSync(new URL(`../../i18n/locales/${locale}.json`, import.meta.url))).toBe(true)
    }
  })

  it('keeps non-default locale files aligned with English keys and placeholders', () => {
    const english = flatten(readLocale(defaultLocale))
    const englishKeys = Object.keys(english).sort()

    for (const locale of nonDefaultLocales) {
      const translated = flatten(readLocale(locale))

      expect(Object.keys(translated).sort()).toEqual(englishKeys)

      for (const key of englishKeys) {
        expect(placeholders(translated[key])).toEqual(placeholders(english[key]))
        expect(translated[key]).not.toMatch(/[<>]/)
      }
    }
  })

  it('keeps linked translation keys resolvable in non-default locales', () => {
    for (const locale of nonDefaultLocales) {
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
