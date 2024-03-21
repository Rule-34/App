import type { IPocketbasePost } from "./pocketbase.dto"

export interface IPostPage {
  data: IPost[]
  meta: IPostPageMeta
  links: IPostPageLinks
}

export interface IPost {

  domain: string

  id: number

  score?: number | null

  high_res_file: IPostHighResFile
  low_res_file: IPostLowResFile
  preview_file: IPostPreviewFile

  tags: IPostTags

  sources: string[]

  rating: string

  media_type: 'image' | 'video' | 'unknown'
}

export interface IPostHighResFile {
  url: string
  width: number
  height: number
}

export interface IPostLowResFile {
  url: string | null
  width: number | null
  height: number | null
}

export interface IPostPreviewFile {
  url: string | null
  width: number | null
  height: number | null
}

export interface IPostTags {
  artist: string[]
  character: string[]
  copyright: string[]
  general: string[]
  meta: string[]
}

export interface IPostPageMeta {
  items_count: number
  total_items: number
  current_page: number
  total_pages: number
  items_per_page: number
}

export interface IPostPageLinks {
  self: string
  first: string
  last: string
  prev: string
  next: string
}

export class PostDTO implements IPost {
  domain: IPost['domain'] = ''

  id: IPost['id'] = 0

  score?: IPost['score']

  high_res_file: IPost['high_res_file'] = {
    url: '',
    width: 0,
    height: 0,
  }
  low_res_file: IPost['low_res_file'] = {
    url: null,
    width: null,
    height: null,
  }
  preview_file: IPost['preview_file'] = {
    url: null,
    width: null,
    height: null,
  }

  tags: IPost['tags'] = {
    artist: [],
    character: [],
    copyright: [],
    general: [],
    meta: [],
  }

  sources: IPost['sources'] = []

  rating: IPost['rating'] = 'unknown'

  media_type: IPost['media_type'] = 'unknown'
}

export default class Post extends PostDTO {
  constructor(dto: PostDTO) {
    super()
    Object.assign(this, dto)
  }

  static fromPocketbasePost(post: IPocketbasePost): Post {

    return new Post({
      id: post.original_id,

      domain: post.original_domain,

      high_res_file: {
        url: post.high_res_file,
        width: post.high_res_file_width,
        height: post.high_res_file_height
      },
      low_res_file: {
        url: post.low_res_file,
        width: post.low_res_file_width,
        height: post.low_res_file_height
      },
      preview_file: {
        url: post.preview_file,
        width: post.preview_file_width,
        height: post.preview_file_height
      },
      tags: {
        artist: post.tags_artist ?? [],
        character: post.tags_character ?? [],
        copyright: post.tags_copyright ?? [],
        general: post.tags_general ?? [],
        meta: post.tags_meta ?? []
      },
      score: post.score,
      sources: post.sources,
      rating: post.rating,
      media_type: post.media_type
    })
  }
}