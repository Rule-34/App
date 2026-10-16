import { describe, expect, it } from 'vitest'
import Post, {
  PostDTO,
  isRenderablePost,
  normalizePost,
  normalizePostFile,
  normalizePostPage,
  type IPost,
  type IPostPage
} from '../../app/assets/js/post.dto'
import type { IPocketbasePost } from '../../app/assets/js/pocketbase.dto'

describe('isRenderablePost', () => {
  it('returns true for renderable media types (image, animated, video)', () => {
    const basePost: IPost = {
      domain: 'rule34.xxx',
      id: 1,
      high_res_file: { url: null, width: null, height: null },
      low_res_file: { url: null, width: null, height: null },
      preview_file: { url: null, width: null, height: null },
      tags: { artist: [], character: [], copyright: [], general: [], meta: [] },
      sources: [],
      rating: 'safe',
      media_type: null
    }

    expect(isRenderablePost({ ...basePost, media_type: 'image' })).toBe(true)
    expect(isRenderablePost({ ...basePost, media_type: 'animated' })).toBe(true)
    expect(isRenderablePost({ ...basePost, media_type: 'video' })).toBe(true)
  })

  it('returns false for non-renderable media types (unknown, null)', () => {
    const basePost: IPost = {
      domain: 'rule34.xxx',
      id: 1,
      high_res_file: { url: null, width: null, height: null },
      low_res_file: { url: null, width: null, height: null },
      preview_file: { url: null, width: null, height: null },
      tags: { artist: [], character: [], copyright: [], general: [], meta: [] },
      sources: [],
      rating: 'safe',
      media_type: null
    }

    expect(isRenderablePost({ ...basePost, media_type: 'unknown' })).toBe(false)
    expect(isRenderablePost({ ...basePost, media_type: null })).toBe(false)
  })
})

describe('PostDTO', () => {
  it('initializes with default values', () => {
    const postDto = new PostDTO()

    expect(postDto.domain).toBe('')
    expect(postDto.id).toBe(0)
    expect(postDto.rating).toBeNull()
    expect(postDto.media_type).toBeNull()
    expect(postDto.sources).toEqual([])
    expect(postDto.high_res_file).toEqual({ url: null, width: null, height: null })
    expect(postDto.tags).toEqual({
      artist: [],
      character: [],
      copyright: [],
      general: [],
      meta: []
    })
  })
})

describe('Post', () => {
  it('instantiates from IPost', () => {
    const postData: IPost = {
      domain: 'gelbooru.com',
      id: 999,
      score: 42,
      high_res_file: { url: 'https://example.com/image.png', width: 800, height: 600 },
      low_res_file: { url: 'https://example.com/low.png', width: 400, height: 300 },
      preview_file: { url: 'https://example.com/preview.png', width: 150, height: 150 },
      tags: {
        artist: ['artist1'],
        character: ['char1'],
        copyright: ['series1'],
        general: ['tag1'],
        meta: ['highres']
      },
      sources: ['https://source.com'],
      rating: 'explicit',
      media_type: 'image'
    }

    const post = new Post(postData)

    expect(post.domain).toBe('gelbooru.com')
    expect(post.id).toBe(999)
    expect(post.score).toBe(42)
    expect(post.tags.artist).toEqual(['artist1'])
    expect(post.media_type).toBe('image')
  })

  it('converts from IPocketbasePost via fromPocketbasePost', () => {
    const pbPost: IPocketbasePost = {
      user_id: 'usr123',
      original_id: 555,
      original_domain: 'rule34.xxx',
      high_res_file: 'https://cdn.example.com/high.jpg',
      high_res_file_width: 1920,
      high_res_file_height: 1080,
      low_res_file: 'https://cdn.example.com/low.jpg',
      preview_file: 'https://cdn.example.com/preview.jpg',
      tags_artist: ['artist_a'],
      tags_character: ['char_b'],
      tags_copyright: ['copy_c'],
      tags_general: ['gen_d'],
      tags_meta: ['meta_e'],
      score: 100,
      sources: ['https://origin.com'],
      rating: 'questionable',
      media_type: 'video'
    }

    const post = Post.fromPocketbasePost(pbPost)

    expect(post.id).toBe(555)
    expect(post.domain).toBe('rule34.xxx')
    expect(post.high_res_file).toEqual({
      url: 'https://cdn.example.com/high.jpg',
      width: 1920,
      height: 1080
    })
    expect(post.low_res_file).toEqual({
      url: 'https://cdn.example.com/low.jpg',
      width: null,
      height: null
    })
    expect(post.preview_file).toEqual({
      url: 'https://cdn.example.com/preview.jpg',
      width: null,
      height: null
    })
    expect(post.tags).toEqual({
      artist: ['artist_a'],
      character: ['char_b'],
      copyright: ['copy_c'],
      general: ['gen_d'],
      meta: ['meta_e']
    })
    expect(post.score).toBe(100)
    expect(post.sources).toEqual(['https://origin.com'])
    expect(post.rating).toBe('questionable')
    expect(post.media_type).toBe('video')
  })

  it('handles optional missing fields when converting from IPocketbasePost', () => {
    const pbPost: IPocketbasePost = {
      user_id: 'usr123',
      original_id: 777,
      original_domain: 'safebooru.org',
      high_res_file: 'https://cdn.example.com/high.jpg',
      preview_file: 'https://cdn.example.com/preview.jpg',
      sources: []
    }

    const post = Post.fromPocketbasePost(pbPost)

    expect(post.id).toBe(777)
    expect(post.low_res_file.url).toBeNull()
    expect(post.tags.artist).toEqual([])
    expect(post.tags.character).toEqual([])
    expect(post.tags.copyright).toEqual([])
    expect(post.tags.general).toEqual([])
    expect(post.tags.meta).toEqual([])
    expect(post.rating).toBeNull()
    expect(post.media_type).toBeNull()
  })
})

describe('normalizePostFile', () => {
  it('cleans valid http/https URLs and strips fragments', () => {
    const file = normalizePostFile({
      url: 'https://example.com/image.jpg#frag',
      width: 100,
      height: 200
    })

    expect(file).toEqual({
      url: 'https://example.com/image.jpg',
      width: 100,
      height: 200
    })
  })

  it('normalizes missing, invalid, or malicious URLs to null', () => {
    expect(normalizePostFile(null)).toEqual({ url: null, width: null, height: null })
    expect(normalizePostFile({ url: '', width: 50, height: 50 })).toEqual({ url: null, width: 50, height: 50 })
    expect(normalizePostFile({ url: 'javascript:alert(1)', width: 50, height: 50 })).toEqual({
      url: null,
      width: 50,
      height: 50
    })
  })
})

describe('normalizePost & normalizePostPage', () => {
  it('normalizes all file URLs in an IPost at the ingestion boundary', () => {
    const rawPost: IPost = {
      domain: 'rule34.xxx',
      id: 123,
      high_res_file: { url: 'https://example.com/high.jpg#tag', width: 1000, height: 800 },
      low_res_file: { url: 'javascript:bad()', width: 500, height: 400 },
      preview_file: { url: '  https://example.com/preview.jpg  ', width: 200, height: 160 },
      tags: { artist: [], character: [], copyright: [], general: [], meta: [] },
      sources: [],
      rating: 'safe',
      media_type: 'image'
    }

    const clean = normalizePost(rawPost)

    expect(clean.high_res_file.url).toBe('https://example.com/high.jpg')
    expect(clean.low_res_file.url).toBeNull()
    expect(clean.preview_file.url).toBe('https://example.com/preview.jpg')
  })

  it('normalizes all posts across an IPostPage', () => {
    const page: IPostPage = {
      data: [
        {
          domain: 'rule34.xxx',
          id: 1,
          high_res_file: { url: 'https://example.com/1.jpg#section', width: 100, height: 100 },
          low_res_file: { url: null, width: null, height: null },
          preview_file: { url: null, width: null, height: null },
          tags: { artist: [], character: [], copyright: [], general: [], meta: [] },
          sources: [],
          rating: 'safe',
          media_type: 'image'
        }
      ],
      meta: { items_count: 1, total_items: 1, current_page: 1, total_pages: 1, items_per_page: 1 },
      links: { self: '', first: '', last: '', prev: '', next: '' }
    }

    const cleanPage = normalizePostPage(page)
    expect(cleanPage.data[0].high_res_file.url).toBe('https://example.com/1.jpg')
  })
})
