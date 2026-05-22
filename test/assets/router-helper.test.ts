import { describe, expect, it } from 'vitest'
import {
  generatePostTagLandingPath,
  generatePostsRoute,
  getFilterQueryValue,
  getSinglePositiveTagQueryValue,
  getTagLandingPathFromPostsQueryPath
} from '../../assets/js/RouterHelper'
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

  it('keeps multiple tag values raw before router serialization', () => {
    const route = generatePostsRoute(
      '/posts',
      'safebooru.org',
      undefined,
      [new Tag({ name: 'panty_&_stocking_with_garterbelt' }), new Tag({ name: 'rating:safe' })],
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

  it('keeps filters as flat bracket query keys for Vue Router', () => {
    const route = generatePostsRoute('/posts', 'safebooru.org', 2, [new Tag({ name: 'rating:safe' })], {
      rating: undefined,
      sort: 'score',
      score: '>=25'
    })

    expect(route).toMatchObject({
      path: '/posts/safebooru.org',
      query: {
        page: '2',
        tags: 'rating:safe',
        'filter[sort]': 'score',
        'filter[score]': '>=25'
      }
    })
    expect(route.query).not.toHaveProperty('filter')
    expect(route.query).not.toHaveProperty('filter[rating]')
  })

  it('reads flat and legacy nested filter query values', () => {
    expect(getFilterQueryValue({ 'filter[sort]': 'score' }, 'sort')).toBe('score')
    expect(getFilterQueryValue({ filter: { score: '>=25' } }, 'score')).toBe('>=25')
  })
})

describe('tag landing route helpers', () => {
  it('builds encoded single-tag landing paths under posts', () => {
    expect(generatePostTagLandingPath('rule34.xxx', 'honkai:_star_rail')).toBe('/posts/rule34.xxx/honkai%3A_star_rail')
    expect(generatePostTagLandingPath('rule34.xxx', '100%')).toBe('/posts/rule34.xxx/100%25')
  })

  it('accepts only single positive tag query values for landing pages', () => {
    expect(getSinglePositiveTagQueryValue('1girl')).toBe('1girl')
    expect(getSinglePositiveTagQueryValue('honkai:_star_rail')).toBe('honkai:_star_rail')
    expect(getSinglePositiveTagQueryValue('-ai_generated')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('bored|cum')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('big breasts')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('rating:safe')).toBeUndefined()
    expect(getSinglePositiveTagQueryValue(['solo', 'cum'])).toBeUndefined()
    expect(getSinglePositiveTagQueryValue('')).toBeUndefined()
  })

  it('converts simple posts tag query paths to landing paths', () => {
    expect(getTagLandingPathFromPostsQueryPath('/posts/rule34.xxx?tags=overwatch')).toBe('/posts/rule34.xxx/overwatch')
    expect(getTagLandingPathFromPostsQueryPath('/posts/rule34.xxx?tags=solo&page=2')).toBeUndefined()
    expect(getTagLandingPathFromPostsQueryPath('/posts/rule34.xxx?tags=solo%7Ccum')).toBeUndefined()
    expect(getTagLandingPathFromPostsQueryPath('/posts/rule34.xxx?tags=-ai_generated')).toBeUndefined()
  })
})
