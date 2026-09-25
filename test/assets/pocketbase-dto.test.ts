import { describe, expect, it } from 'vitest'
import { PocketbasePost, PocketbasePostDTO, type IPocketbasePost } from '../../app/assets/js/pocketbase.dto'
import Post, { type IPost } from '../../app/assets/js/post.dto'

describe('PocketbasePostDTO', () => {
  it('initializes with default values', () => {
    const dto = new PocketbasePostDTO()

    expect(dto.id).toBeUndefined()
    expect(dto.user_id).toBe('')
    expect(dto.created).toBeUndefined()
    expect(dto.updated).toBeUndefined()
    expect(dto.original_id).toBe(0)
    expect(dto.original_domain).toBe('')
    expect(dto.high_res_file).toBe('')
    expect(dto.high_res_file_width).toBeUndefined()
    expect(dto.high_res_file_height).toBeUndefined()
    expect(dto.low_res_file).toBeUndefined()
    expect(dto.low_res_file_width).toBeUndefined()
    expect(dto.low_res_file_height).toBeUndefined()
    expect(dto.preview_file).toBe('')
    expect(dto.preview_file_width).toBeUndefined()
    expect(dto.preview_file_height).toBeUndefined()
    expect(dto.tags_artist).toEqual([])
    expect(dto.tags_character).toEqual([])
    expect(dto.tags_copyright).toEqual([])
    expect(dto.tags_general).toEqual([])
    expect(dto.tags_meta).toEqual([])
    expect(dto.tags).toEqual([])
    expect(dto.score).toBeUndefined()
    expect(dto.sources).toEqual([])
    expect(dto.rating).toBeUndefined()
    expect(dto.media_type).toBeUndefined()
  })
})

describe('PocketbasePost', () => {
  it('instantiates and assigns properties from dto', () => {
    const rawDto: IPocketbasePost = {
      id: 'pb-123',
      user_id: 'user-456',
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-02T00:00:00.000Z',
      original_id: 42,
      original_domain: 'rule34.xxx',
      high_res_file: 'https://img.rule34.xxx/high.jpg',
      high_res_file_width: 1920,
      high_res_file_height: 1080,
      low_res_file: 'https://img.rule34.xxx/low.jpg',
      low_res_file_width: 800,
      low_res_file_height: 600,
      preview_file: 'https://img.rule34.xxx/preview.jpg',
      preview_file_width: 250,
      preview_file_height: 250,
      tags_artist: ['artist_name'],
      tags_character: ['character_name'],
      tags_copyright: ['series_name'],
      tags_general: ['tag1', 'tag2'],
      tags_meta: ['highres'],
      tags: [
        { name: 'artist_name', type: 'artist' },
        { name: 'character_name', type: 'character' },
        { name: 'series_name', type: 'copyright' },
        { name: 'tag1', type: 'general' },
        { name: 'tag2', type: 'general' },
        { name: 'highres', type: 'meta' }
      ],
      score: 100,
      sources: ['https://source.com/post/42'],
      rating: 'explicit',
      media_type: 'image'
    }

    const pbPost = new PocketbasePost(rawDto)

    expect(pbPost.id).toBe('pb-123')
    expect(pbPost.user_id).toBe('user-456')
    expect(pbPost.original_id).toBe(42)
    expect(pbPost.original_domain).toBe('rule34.xxx')
    expect(pbPost.high_res_file).toBe('https://img.rule34.xxx/high.jpg')
    expect(pbPost.high_res_file_width).toBe(1920)
    expect(pbPost.high_res_file_height).toBe(1080)
    expect(pbPost.low_res_file).toBe('https://img.rule34.xxx/low.jpg')
    expect(pbPost.low_res_file_width).toBe(800)
    expect(pbPost.low_res_file_height).toBe(600)
    expect(pbPost.preview_file).toBe('https://img.rule34.xxx/preview.jpg')
    expect(pbPost.preview_file_width).toBe(250)
    expect(pbPost.preview_file_height).toBe(250)
    expect(pbPost.tags_artist).toEqual(['artist_name'])
    expect(pbPost.tags_character).toEqual(['character_name'])
    expect(pbPost.tags_copyright).toEqual(['series_name'])
    expect(pbPost.tags_general).toEqual(['tag1', 'tag2'])
    expect(pbPost.tags_meta).toEqual(['highres'])
    expect(pbPost.tags).toHaveLength(6)
    expect(pbPost.score).toBe(100)
    expect(pbPost.sources).toEqual(['https://source.com/post/42'])
    expect(pbPost.rating).toBe('explicit')
    expect(pbPost.media_type).toBe('image')
  })

  it('converts from Post with all fields populated via fromPost', () => {
    const postData: IPost = {
      domain: 'gelbooru.com',
      id: 777,
      score: 88,
      high_res_file: { url: 'https://gelbooru.com/high.jpg', width: 2000, height: 1500 },
      low_res_file: { url: 'https://gelbooru.com/low.jpg', width: 1000, height: 750 },
      preview_file: { url: 'https://gelbooru.com/thumb.jpg', width: 200, height: 150 },
      tags: {
        artist: ['picasso'],
        character: ['mario'],
        copyright: ['nintendo'],
        general: ['solo', 'hat'],
        meta: ['absurdres']
      },
      sources: ['https://pixiv.net/art/777'],
      rating: 'questionable',
      media_type: 'image'
    }

    const post = new Post(postData)
    const pbPost = PocketbasePost.fromPost(post, 'user-abc')

    expect(pbPost.user_id).toBe('user-abc')
    expect(pbPost.original_id).toBe(777)
    expect(pbPost.original_domain).toBe('gelbooru.com')
    expect(pbPost.high_res_file).toBe('https://gelbooru.com/high.jpg')
    expect(pbPost.high_res_file_width).toBe(2000)
    expect(pbPost.high_res_file_height).toBe(1500)
    expect(pbPost.low_res_file).toBe('https://gelbooru.com/low.jpg')
    expect(pbPost.low_res_file_width).toBe(1000)
    expect(pbPost.low_res_file_height).toBe(750)
    expect(pbPost.preview_file).toBe('https://gelbooru.com/thumb.jpg')
    expect(pbPost.preview_file_width).toBe(200)
    expect(pbPost.preview_file_height).toBe(150)
    expect(pbPost.tags_artist).toEqual(['picasso'])
    expect(pbPost.tags_character).toEqual(['mario'])
    expect(pbPost.tags_copyright).toEqual(['nintendo'])
    expect(pbPost.tags_general).toEqual(['solo', 'hat'])
    expect(pbPost.tags_meta).toEqual(['absurdres'])
    expect(pbPost.tags).toEqual([
      { name: 'picasso', type: 'artist' },
      { name: 'mario', type: 'character' },
      { name: 'nintendo', type: 'copyright' },
      { name: 'solo', type: 'general' },
      { name: 'hat', type: 'general' },
      { name: 'absurdres', type: 'meta' }
    ])
    expect(pbPost.score).toBe(88)
    expect(pbPost.sources).toEqual(['https://pixiv.net/art/777'])
    expect(pbPost.rating).toBe('questionable')
    expect(pbPost.media_type).toBe('image')
  })

  it('converts from Post with missing/empty optional fields via fromPost', () => {
    const postData: IPost = {
      domain: 'rule34.xxx',
      id: 123,
      score: null,
      high_res_file: { url: null, width: null, height: null },
      low_res_file: { url: null, width: null, height: null },
      preview_file: { url: null, width: null, height: null },
      tags: {
        artist: [],
        character: [],
        copyright: [],
        general: [],
        meta: []
      },
      sources: [],
      rating: null,
      media_type: null
    }

    const post = new Post(postData)
    const pbPost = PocketbasePost.fromPost(post, 'user-xyz')

    expect(pbPost.user_id).toBe('user-xyz')
    expect(pbPost.original_id).toBe(123)
    expect(pbPost.original_domain).toBe('rule34.xxx')
    expect(pbPost.high_res_file).toBe('')
    expect(pbPost.high_res_file_width).toBeUndefined()
    expect(pbPost.high_res_file_height).toBeUndefined()
    expect(pbPost.low_res_file).toBeUndefined()
    expect(pbPost.low_res_file_width).toBeUndefined()
    expect(pbPost.low_res_file_height).toBeUndefined()
    expect(pbPost.preview_file).toBe('')
    expect(pbPost.preview_file_width).toBeUndefined()
    expect(pbPost.preview_file_height).toBeUndefined()
    expect(pbPost.tags_artist).toBeUndefined()
    expect(pbPost.tags_character).toBeUndefined()
    expect(pbPost.tags_copyright).toBeUndefined()
    expect(pbPost.tags_general).toBeUndefined()
    expect(pbPost.tags_meta).toBeUndefined()
    expect(pbPost.tags).toEqual([])
    expect(pbPost.score).toBeUndefined()
    expect(pbPost.sources).toEqual([])
    expect(pbPost.rating).toBeUndefined()
    expect(pbPost.media_type).toBeUndefined()
  })
})
