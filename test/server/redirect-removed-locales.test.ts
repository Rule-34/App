import { fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { removedLocaleCodes } from '../../config/i18n'

describe('redirect removed locales middleware', async () => {
  await setup({ browser: true })

  it.each(removedLocaleCodes.map((locale) => [locale, `/posts/rule34.xxx`]))(
    'returns 301 for /%s/posts/...',
    async (locale, suffix) => {
      const response = await fetch(`/${locale}${suffix}`, { redirect: 'manual' })

      expect(response.status).toBe(301)
      expect(response.headers.get('location')).toBe(suffix)
    }
  )

  it('preserves query strings on 301 redirects', async () => {
    const response = await fetch('/th/posts/e621.net?tags=1girl', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/posts/e621.net?tags=1girl')
  })

  it('omits hash fragments from redirect targets', async () => {
    const response = await fetch('/th/posts/e621.net?tags=1girl#media', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/posts/e621.net?tags=1girl')
  })

  it('redirects retired locale home prefixes to /', async () => {
    const response = await fetch('/hi/', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/')
  })

  it('normalizes double slashes after stripping the locale prefix', async () => {
    const response = await fetch('/pl//posts/rule34.xxx', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/posts/rule34.xxx')
  })

  it('does not redirect paths that merely contain retired locale codes', async () => {
    const response = await fetch('/posts/thighhighs', { redirect: 'manual' })

    expect(response.status).not.toBe(301)
  })

  it('does not redirect active locale prefixes', async () => {
    const response = await fetch('/ru/posts/rule34.xxx', { redirect: 'manual' })

    expect(response.status).not.toBe(301)
  })
})
