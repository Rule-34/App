import {describe, expect, it} from 'vitest'
import {generatePostsRoute, parseRouteTags} from '../../assets/js/RouterHelper'
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
        tags: ['panty_%26_stocking_with_garterbelt']
      }
    })

    expect(parseRouteTags(route.query?.tags)).toEqual([{ name: 'panty_&_stocking_with_garterbelt' }])
  })

  it('stores multiple tags as repeated query values', () => {
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
        tags: ['panty_%26_stocking_with_garterbelt', 'rating%3Asafe']
      }
    })

    expect(parseRouteTags(route.query?.tags)).toEqual([
      { name: 'panty_&_stocking_with_garterbelt' },
      { name: 'rating:safe' }
    ])
  })
})
