import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { defaultLocale, locales } from '../../config/i18n'

const nonDefaultLocales = locales.filter((locale) => locale.code !== defaultLocale).map((locale) => locale.code)
const paths = [
  'toasts.cloudSyncFailed',
  'toasts.cloudDataDeleted',
  'toasts.accountDeletionCancelled',
  'pages.premium.dashboard.dataAccountTitle',
  'pages.premium.dashboard.dataAccountDescription',
  'pages.premium.dashboard.deleteCloudData',
  'pages.premium.dashboard.deleteCloudDataConfirm',
  'pages.premium.dashboard.deleteAccount',
  'pages.premium.dashboard.deleteAccountConfirm',
  'pages.premium.dashboard.deleteAccountBillingNote'
] as const

function readLocale(locale: string) {
  return JSON.parse(readFileSync(new URL(`../../i18n/locales/${locale}.json`, import.meta.url), 'utf8')) as Record<
    string,
    unknown
  >
}

function getValue(locale: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((value, key) => {
    if (!value || typeof value !== 'object') {
      return undefined
    }

    return (value as Record<string, unknown>)[key]
  }, locale)
}

function placeholders(value: string) {
  return Array.from(value.matchAll(/\{[^}]+}/g), ([placeholder]) => placeholder)
}

describe('premium cloud sync locale entries', () => {
  it('localizes the new user-facing copy outside English', () => {
    const english = readLocale('en')

    for (const localeName of nonDefaultLocales) {
      const locale = readLocale(localeName)

      for (const path of paths) {
        const englishValue = getValue(english, path)
        const localeValue = getValue(locale, path)

        expect(typeof englishValue).toBe('string')
        expect(typeof localeValue).toBe('string')
        expect(localeValue).not.toBe(englishValue)
        expect(placeholders(localeValue as string)).toEqual(placeholders(englishValue as string))
      }
    }
  })
})
