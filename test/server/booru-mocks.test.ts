import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

describe('Booru API test mocks', async () => {
  await setup({ browser: true })

  it('serves the first posts page from the local Nitro mock', async () => {
    const response = await $fetch('/booru/gelbooru/posts?baseEndpoint=safebooru.org&pageID=0&limit=30')

    expect(response.data).toHaveLength(30)
    expect(response.data[0].id).toBe(4414654)
    expect(response.links.self).toContain('/booru/gelbooru/posts?')
    expect(response.links.next).toContain('pageID=1')
  })

  it('preserves tags in localized pagination links', async () => {
    const response = await $fetch('/booru/gelbooru/posts?baseEndpoint=safebooru.org&pageID=0&limit=30&tags=hair_bun')

    expect(response.links.self).toContain('tags=hair_bun')
    expect(response.links.next).toContain('tags=hair_bun')
  })
})
