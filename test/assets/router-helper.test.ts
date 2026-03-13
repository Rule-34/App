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
})
