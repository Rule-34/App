import { describe, expect, it } from 'vitest'
import { postHasBlockedTag } from '../../app/assets/js/post-blocklist'
import type { IRenderablePost } from '../../app/assets/js/post.dto'

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
