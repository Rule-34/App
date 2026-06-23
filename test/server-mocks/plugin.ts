/**
 * Test-only Nitro plugin: mocks booru API endpoints so SSR tests
 * don't hit the real API. Injected via $test.nitro.plugins in nuxt.config.
 */
import { createError, defineEventHandler, getRequestURL } from 'h3'
import {
  mockPostsPage0,
  mockPostsPage1,
  mockPostsPageWithOfflineMedia,
  mockPostsPageWithUnknownMedia,
  mockPostsPageWithoutResults
} from '../pages/posts.mock-data'

export const validPocketbaseToken = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJleHAiOjQxMDI0NDQ4MDAsImlkIjoidGVzdC11c2VyIn0',
  'signature'
].join('.')

export const authRecord = {
  id: 'test-user',
  email: 'test@example.com',
  username: 'test-user',
  subscription_expires_at: '2099-12-31T00:00:00.000Z'
}

const queryParamsToPreserve = ['baseEndpoint', 'limit', 'tags', 'order', 'rating', 'score', 'httpScheme']

type NitroPlugin = (nitroApp: unknown) => unknown

const defineNitroPluginSafe =
  typeof defineNitroPlugin === 'function' ? defineNitroPlugin : <T extends NitroPlugin>(plugin: T) => plugin

function localizeMockPageLinks(page: typeof mockPostsPage0, requestUrl: URL) {
  const localizedPage = structuredClone(page)

  localizedPage.links = Object.fromEntries(
    Object.entries(localizedPage.links).map(([key, href]) => {
      if (!href) {
        return [key, href]
      }

      const localizedHref = new URL(href)
      localizedHref.protocol = requestUrl.protocol
      localizedHref.host = requestUrl.host

      for (const param of queryParamsToPreserve) {
        const value = requestUrl.searchParams.get(param)

        if (value == null || value === '') {
          localizedHref.searchParams.delete(param)
        } else {
          localizedHref.searchParams.set(param, value)
        }
      }

      return [key, `${localizedHref.pathname}${localizedHref.search}${localizedHref.hash}`]
    })
  ) as typeof localizedPage.links

  return localizedPage
}

function resolveMockPostsPage(requestUrl: URL) {
  const tags = requestUrl.searchParams.get('tags')
  const pageID = requestUrl.searchParams.get('pageID') ?? '0'

  if (tags === 'empty_test') {
    return mockPostsPageWithoutResults
  }

  if (tags === 'offline_test') {
    return mockPostsPageWithOfflineMedia
  }

  if (tags === 'unknown_media_test') {
    return mockPostsPageWithUnknownMedia
  }

  if (tags === '1girl') {
    return {
      ...mockPostsPage1,
      links: {
        ...mockPostsPage1.links,
        next: null
      }
    }
  }

  if (tags === 'hair_bun') {
    if (pageID === '1') {
      return {
        ...mockPostsPage1,
        links: {
          ...mockPostsPage1.links,
          next: null
        }
      }
    }

    return mockPostsPage0
  }

  if (pageID === '1') {
    return {
      ...mockPostsPage1,
      links: {
        ...mockPostsPage1.links,
        next: null
      }
    }
  }

  return mockPostsPage0
}

export default defineNitroPluginSafe((nitroApp) => {
  nitroApp.router.use(
    '/booru/**',
    defineEventHandler((event) => {
      const requestUrl = getRequestURL(event)

      if (requestUrl.pathname.endsWith('/posts')) {
        return localizeMockPageLinks(resolveMockPostsPage(requestUrl), requestUrl)
      }

      if (requestUrl.pathname.endsWith('/tags')) {
        return []
      }

      // Any other /booru/* path returns 404.
      // If a test hits this, add the missing endpoint above.
      throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    })
  )

  nitroApp.router.use(
    '/api/collections/users/auth-refresh**',
    defineEventHandler(() => {
      return {
        token: validPocketbaseToken,
        record: authRecord
      }
    })
  )
})
