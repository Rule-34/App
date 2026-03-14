import {describe, expect, it} from 'vitest'
import {generatePostsRoute} from '../../assets/js/RouterHelper'
import Tag from '../../assets/js/tag.dto'

describe('generatePostsRoute', () => {
  it('encodes ampersands in tag query values', () => {
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
        tags: 'panty_%26_stocking_with_garterbelt'
      }
    })

    expect(decodeURIComponent(String(route.query?.tags))).toBe('panty_&_stocking_with_garterbelt')
  })

  it('encodes multiple tags joined by pipes when one contains an ampersand', () => {
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
        tags: 'panty_%26_stocking_with_garterbelt|rating%3Asafe'
      }
    })

    expect(decodeURIComponent(String(route.query?.tags))).toBe(
      'panty_&_stocking_with_garterbelt|rating:safe'
    )
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
