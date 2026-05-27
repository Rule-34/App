import { afterEach, describe, expect, it, vi } from 'vitest'

async function importPluginHelpers() {
  vi.stubGlobal('defineNitroPlugin', (plugin: unknown) => plugin)

  return import('../../server/plugins/fix-canonical-queries')
}

describe('posts index canonical path matching', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('keeps the domain in the second capture when no locale prefixes are configured', async () => {
    const { createPostsIndexPathRe } = await importPluginHelpers()
    const match = '/posts/e621.net'.match(createPostsIndexPathRe([]))

    expect(match?.[1]).toBe('')
    expect(match?.[2]).toBe('e621.net')
  })

  it('captures the optional locale and domain when locale prefixes are configured', async () => {
    const { createPostsIndexPathRe } = await importPluginHelpers()
    const match = '/es/posts/e621.net'.match(createPostsIndexPathRe(['es', 'pt']))

    expect(match?.[1]).toBe('es')
    expect(match?.[2]).toBe('e621.net')
  })
})
