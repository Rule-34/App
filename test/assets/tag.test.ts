import { FetchError } from 'ofetch'
import { describe, expect, it } from 'vitest'
import { postHasBlockedTag } from '../../app/assets/js/post-blocklist'
import type { IRenderablePost } from '../../app/assets/js/post.dto'
import { shouldReportTagSearchError } from '../../app/assets/js/tag-search-error'
import Tag, { TagDTO, toggleSelectedTag } from '../../app/assets/js/tag.dto'
import { TagCollection, TagCollectionDTO } from '../../app/assets/js/tagCollection.dto'

function selectedTagNames(names: readonly string[], tag: string) {
  const selectedTags = names.map((name) => new Tag({ name }))

  return toggleSelectedTag(selectedTags, tag).map((selectedTag) => selectedTag.name)
}

function createMockPost(overrides: Partial<IRenderablePost> = {}): IRenderablePost {
  return {
    domain: 'rule34.xxx',
    id: 12345,
    score: 10,
    rating: 'explicit',
    media_type: 'image',
    sources: ['https://example.com'],
    high_res_file: { url: 'https://example.com/high.jpg', width: 1000, height: 1000 },
    low_res_file: { url: 'https://example.com/low.jpg', width: 500, height: 500 },
    preview_file: { url: 'https://example.com/preview.jpg', width: 150, height: 150 },
    tags: {
      artist: [],
      character: [],
      copyright: [],
      general: [],
      meta: []
    },
    ...overrides
  }
}

describe('Tag and TagDTO', () => {
  it('TagDTO initializes with default name and exports to JSON', () => {
    const tagDto = new TagDTO()
    expect(tagDto.name).toBe('')
    expect(tagDto.type).toBeUndefined()
    expect(tagDto.count).toBeUndefined()
    expect(tagDto.toJSON()).toEqual({ name: '' })
  })

  it('Tag instantiates and assigns properties from ITag', () => {
    const tag = new Tag({ name: 'overwatch', type: 'copyright', count: 150 })
    expect(tag.name).toBe('overwatch')
    expect(tag.type).toBe('copyright')
    expect(tag.count).toBe(150)
    expect(tag.toJSON()).toEqual({ name: 'overwatch', type: 'copyright', count: 150 })
  })
})

describe('TagCollection and TagCollectionDTO', () => {
  it('TagCollectionDTO initializes with empty name and tags array', () => {
    const collectionDto = new TagCollectionDTO()
    expect(collectionDto.name).toBe('')
    expect(collectionDto.tags).toEqual([])
  })

  it('TagCollection creates an isolated copy of the tags array', () => {
    const initialTags = ['tag1', 'tag2']
    const collection = new TagCollection({ name: 'Favorites', tags: initialTags })

    expect(collection.name).toBe('Favorites')
    expect(collection.tags).toEqual(['tag1', 'tag2'])

    // Mutating original array does not affect collection
    initialTags.push('tag3')
    expect(collection.tags).toEqual(['tag1', 'tag2'])
  })
})

describe('toggleSelectedTag', () => {
  it('adds the tag to the selection', () => {
    expect(selectedTagNames([], 'solo')).toEqual(['solo'])
    expect(selectedTagNames(['1girl'], 'solo')).toEqual(['1girl', 'solo'])
  })

  it('keeps the given tag type and count', () => {
    const [addedTag] = toggleSelectedTag([], 'seiza')

    expect(addedTag).toEqual(new Tag({ name: 'seiza' }).toJSON())
  })

  it('removes the tag when it is already selected', () => {
    expect(selectedTagNames(['1girl', 'solo'], 'solo')).toEqual(['1girl'])
    expect(selectedTagNames(['-yaoi'], '-yaoi')).toEqual([])
  })

  it('drops the positive tag when its negative form is added', () => {
    expect(selectedTagNames(['solo', '1girl'], '-solo')).toEqual(['1girl', '-solo'])
  })

  it('drops the negative tag when its positive form is added', () => {
    expect(selectedTagNames(['-solo', '1girl'], 'solo')).toEqual(['1girl', 'solo'])
  })

  it('does not keep both forms of the same tag', () => {
    const withExcludedTag = selectedTagNames(['solo'], '-solo')
    const withPositiveTag = selectedTagNames(withExcludedTag, 'solo')

    expect(withExcludedTag).toEqual(['-solo'])
    expect(withPositiveTag).toEqual(['solo'])
  })

  it('does not mutate the given selection', () => {
    const selectedTags = [new Tag({ name: '1girl' })]

    toggleSelectedTag(selectedTags, 'solo')
    toggleSelectedTag(selectedTags, '1girl')

    expect(selectedTags).toEqual([{ name: '1girl' }])
  })
})

describe('tag search error reporting', () => {
  it('does not report handled fetch failures to Sentry', () => {
    expect(shouldReportTagSearchError(new FetchError('Service unavailable'))).toBe(false)
  })

  it('reports unexpected non-fetch errors to Sentry', () => {
    expect(shouldReportTagSearchError(new Error('Unexpected tag search failure'))).toBe(true)
  })
})

describe('postHasBlockedTag', () => {
  it('returns false when blockedTags is empty', () => {
    const post = createMockPost({
      tags: {
        artist: ['artist_name'],
        character: ['character_name'],
        copyright: ['series_name'],
        general: ['solo', 'female'],
        meta: ['highres']
      }
    })

    expect(postHasBlockedTag(post, new Set())).toBe(false)
  })

  it('returns true when a general tag is in the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: [],
        character: [],
        copyright: [],
        general: ['goro', 'tentacles'],
        meta: []
      }
    })

    expect(postHasBlockedTag(post, new Set(['goro']))).toBe(true)
  })

  it('returns true when an artist tag is in the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: ['blocked_artist'],
        character: [],
        copyright: [],
        general: ['solo'],
        meta: []
      }
    })

    expect(postHasBlockedTag(post, new Set(['blocked_artist']))).toBe(true)
  })

  it('returns true when a character tag is in the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: [],
        character: ['blocked_character'],
        copyright: [],
        general: ['solo'],
        meta: []
      }
    })

    expect(postHasBlockedTag(post, new Set(['blocked_character']))).toBe(true)
  })

  it('returns true when a copyright tag is in the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: [],
        character: [],
        copyright: ['blocked_series'],
        general: ['solo'],
        meta: []
      }
    })

    expect(postHasBlockedTag(post, new Set(['blocked_series']))).toBe(true)
  })

  it('returns true when a meta tag is in the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: [],
        character: [],
        copyright: [],
        general: ['solo'],
        meta: ['blocked_meta']
      }
    })

    expect(postHasBlockedTag(post, new Set(['blocked_meta']))).toBe(true)
  })

  it('returns false when none of the post tags match the blocked tags set', () => {
    const post = createMockPost({
      tags: {
        artist: ['safe_artist'],
        character: ['safe_character'],
        copyright: ['safe_series'],
        general: ['safe_tag'],
        meta: ['safe_meta']
      }
    })

    expect(postHasBlockedTag(post, new Set(['other_artist', 'other_tag']))).toBe(false)
  })
})
