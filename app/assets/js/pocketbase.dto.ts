import type Post from './post.dto'

export interface IPocketbasePost {
  id?: string

  // Relations
  user_id: string

  // Default fields
  created?: string
  updated?: string

  // Fields
  original_id: number
  original_domain: string

  high_res_file: string
  high_res_file_width?: number
  high_res_file_height?: number
  low_res_file?: string
  low_res_file_width?: number
  low_res_file_height?: number
  preview_file: string
  preview_file_width?: number
  preview_file_height?: number

  tags_artist?: string[]
  tags_character?: string[]
  tags_copyright?: string[]
  tags_general?: string[]
  tags_meta?: string[]
  tags?: {
    name: string
    type: 'artist' | 'character' | 'copyright' | 'general' | 'meta'
  }[]

  score?: number

  sources: string[]

  rating?: string

  media_type?: 'image' | 'animated' | 'video' | 'unknown'
}

export interface ISimplePocketbasePost {
  id: string

  original_domain: string
  original_id: number
}

export class PocketbasePostDTO implements IPocketbasePost {
  id: IPocketbasePost['id'] = undefined
  user_id: IPocketbasePost['user_id'] = ''
  created: IPocketbasePost['created'] = undefined
  updated: IPocketbasePost['updated'] = undefined
  original_id: IPocketbasePost['original_id'] = 0
  original_domain: IPocketbasePost['original_domain'] = ''
  high_res_file: IPocketbasePost['high_res_file'] = ''
  high_res_file_width: IPocketbasePost['high_res_file_width'] = undefined
  high_res_file_height: IPocketbasePost['high_res_file_height'] = undefined
  low_res_file: IPocketbasePost['low_res_file'] = undefined
  low_res_file_width: IPocketbasePost['low_res_file_width'] = undefined
  low_res_file_height: IPocketbasePost['low_res_file_height'] = undefined
  preview_file: IPocketbasePost['preview_file'] = ''
  preview_file_width: IPocketbasePost['preview_file_width'] = undefined
  preview_file_height: IPocketbasePost['preview_file_height'] = undefined
  tags_artist: IPocketbasePost['tags_artist'] = []
  tags_character: IPocketbasePost['tags_character'] = []
  tags_copyright: IPocketbasePost['tags_copyright'] = []
  tags_general: IPocketbasePost['tags_general'] = []
  tags_meta: IPocketbasePost['tags_meta'] = []
  tags: IPocketbasePost['tags'] = []
  score: IPocketbasePost['score'] = undefined
  sources: IPocketbasePost['sources'] = []
  rating: IPocketbasePost['rating'] = undefined
  media_type: IPocketbasePost['media_type'] = undefined
}

export class PocketbasePost extends PocketbasePostDTO {
  constructor(dto: IPocketbasePost) {
    super()
    Object.assign(this, dto)
  }

  static fromPost(post: Post, user_id: string): PocketbasePost {
    return new PocketbasePost({
      original_id: post.id,

      original_domain: post.domain,

      high_res_file: post.high_res_file.url ?? '',
      high_res_file_width: post.high_res_file.width ?? undefined,
      high_res_file_height: post.high_res_file.height ?? undefined,

      low_res_file: post.low_res_file.url ?? undefined,
      low_res_file_width: post.low_res_file.width ?? undefined,
      low_res_file_height: post.low_res_file.height ?? undefined,

      preview_file: post.preview_file.url ?? '',
      preview_file_width: post.preview_file.width ?? undefined,
      preview_file_height: post.preview_file.height ?? undefined,

      tags_artist: post.tags.artist.length > 0 ? post.tags.artist : undefined,
      tags_character: post.tags.character.length > 0 ? post.tags.character : undefined,
      tags_copyright: post.tags.copyright.length > 0 ? post.tags.copyright : undefined,
      tags_general: post.tags.general.length > 0 ? post.tags.general : undefined,
      tags_meta: post.tags.meta.length > 0 ? post.tags.meta : undefined,

      tags: [
        ...post.tags.artist.map((tag) => ({ name: tag, type: 'artist' as const })),
        ...post.tags.character.map((tag) => ({ name: tag, type: 'character' as const })),
        ...post.tags.copyright.map((tag) => ({ name: tag, type: 'copyright' as const })),
        ...post.tags.general.map((tag) => ({ name: tag, type: 'general' as const })),
        ...post.tags.meta.map((tag) => ({ name: tag, type: 'meta' as const }))
      ],

      score: post.score ?? undefined,
      sources: post.sources,
      rating: post.rating ?? undefined,
      media_type: post.media_type ?? undefined,

      user_id
    })
  }
}
