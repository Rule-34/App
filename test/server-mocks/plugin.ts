/**
 * Test-only Nitro plugin: mocks booru API endpoints so SSR tests
 * don't hit the real API. Injected via $test.nitro.plugins in nuxt.config.
 */
import { defineEventHandler, getRequestURL } from 'h3'
import { mockPostsPage0 } from '../pages/posts.mock-data'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.h3App.use('/booru', defineEventHandler((event) => {
    const url = getRequestURL(event)

    if (url.pathname.endsWith('/posts')) {
      return mockPostsPage0
    }

    if (url.pathname.endsWith('/tags')) {
      return []
    }
  }))
})
