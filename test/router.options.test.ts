import { describe, expect, it } from 'vitest'
import routerOptions from '../app/router.options'

const route = ({ path = '/posts/safebooru.org', hash = '', query = {} } = {}) =>
  ({
    path,
    hash,
    query
  }) as any

describe('router scroll behavior', () => {
  const scrollBehavior = routerOptions.scrollBehavior!

  it('keeps scroll position when only the page query changes on the same route', () => {
    expect(scrollBehavior(route({ query: { page: '2' } }), route({ query: { page: '1' } }), null)).toBeUndefined()
  })

  it('scrolls to top when page changes together with another query value', () => {
    expect(
      scrollBehavior(route({ query: { page: '1', tags: '1girl' } }), route({ query: { page: '2' } }), null)
    ).toEqual({ left: 0, top: 0 })
  })
})
