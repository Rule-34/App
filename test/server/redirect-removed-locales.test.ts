import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

describe('redirect removed locales middleware', async () => {
  await setup({ browser: true })

  it('returns 301 for retired locale post paths', async () => {
    const response = await $fetch.raw('/pl/posts/rule34.xxx', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/posts/rule34.xxx')
  })

  it('preserves query strings on 301 redirects', async () => {
    const response = await $fetch.raw('/th/posts/e621.net?tags=1girl', { redirect: 'manual' })

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('/posts/e621.net?tags=1girl')
  })

  it('does not redirect active locale prefixes', async () => {
    const response = await $fetch.raw('/ru/posts/rule34.xxx', { redirect: 'manual' })

    expect(response.status).not.toBe(301)
  })
})
