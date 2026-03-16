import {describe, expect, it} from 'vitest'
import {generatePostsRoute} from '../../assets/js/RouterHelper'
import Tag from '../../assets/js/tag.dto'

describe('generatePostsRoute', () => {
  it('keeps raw tag values in route query objects', () => {
    const route = generatePostsRoute(
      '/posts',
      'safebooru.org',
      undefined,
      [new Tag({ name: 'panty_&_stocking_with_garterbelt' })],
      undefined
    )

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        tags: 'panty_&_stocking_with_garterbelt'
      }
    })
    expect(String(route.query?.tags)).toBe('panty_&_stocking_with_garterbelt')
  })

  it('keeps multiple tag and filter values raw before router serialization', () => {
    const route = generatePostsRoute(
      '/posts',
      'safebooru.org',
      undefined,
      [
        new Tag({ name: 'panty_&_stocking_with_garterbelt' }),
        new Tag({ name: 'rating:safe' })
      ],
      undefined
    )

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        tags: 'panty_&_stocking_with_garterbelt|rating:safe'
      }
    })

    expect(String(route.query?.tags)).toBe('panty_&_stocking_with_garterbelt|rating:safe')
  })

  it('keeps filter values in query object', () => {
    const route = generatePostsRoute('/posts', 'safebooru.org', undefined, undefined, {
      type: 'video',
      sort: 'score'
    })

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        filter: {
          type: 'video',
          sort: 'score'
        }
      }
    })
  })
})
