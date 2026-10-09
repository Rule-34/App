import type { IPocketbasePost } from './pocketbase.dto'
import { cleanMediaUrl } from './media-resilience'

export interface IPostPage {
  data: IPost[]
  meta: IPostPageMeta
  links: IPostPageLinks
}

export interface IPost {
  domain: string

  id: number

  score?: number | null

  high_res_file: IPostFile
  low_res_file: IPostFile
  preview_file: IPostFile

  tags: IPostTags

  sources: string[]

  rating: string | null

  media_type: 'image' | 'animated' | 'video' | 'unknown' | null
}

export type PostMediaType = Exclude<IPost['media_type'], 'unknown' | null>
export type IRenderablePost = IPost & { media_type: PostMediaType }

export function isRenderablePost(post: IPost): post is IRenderablePost {
  return post.media_type === 'image' || post.media_type === 'animated' || post.media_type === 'video'
}

export interface IPostFile {
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
    url: null,
    width: null,
    height: null
  }
  low_res_file: IPost['low_res_file'] = {
    url: null,
    width: null,
    height: null
  }
  preview_file: IPost['preview_file'] = {
    url: null,
    width: null,
    height: null
  }

  tags: IPost['tags'] = {
    artist: [],
    character: [],
    copyright: [],
    general: [],
    meta: []
  }

  sources: IPost['sources'] = []

  rating: IPost['rating'] = null

  media_type: IPost['media_type'] = null
}

export default class Post extends PostDTO {
  constructor(dto: IPost) {
    super()
    Object.assign(this, dto)
  }

  static fromPocketbasePost(post: IPocketbasePost): Post {
    return new Post({
      id: post.original_id,

      domain: post.original_domain,

      high_res_file: {
        url: cleanMediaUrl(post.high_res_file),
        width: post.high_res_file_width ?? null,
        height: post.high_res_file_height ?? null
      },
      low_res_file: {
        url: cleanMediaUrl(post.low_res_file),
        width: post.low_res_file_width ?? null,
        height: post.low_res_file_height ?? null
      },
      preview_file: {
        url: cleanMediaUrl(post.preview_file),
        width: post.preview_file_width ?? null,
        height: post.preview_file_height ?? null
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
      rating: post.rating ?? null,
      media_type: post.media_type ?? null
    })
  }
}

/**
 * Normalizes an IPostFile by stripping fragments and validating that its URL is a valid HTTP(S) URL.
 */
export function normalizePostFile(file?: IPostFile | null): IPostFile {
  return {
    url: cleanMediaUrl(file?.url),
    width: file?.width ?? null,
    height: file?.height ?? null
  }
}

/**
 * Normalizes an IPost by ensuring all media URLs (high_res_file, low_res_file, preview_file)
 * are validated, stripped of fragments, and restricted to safe HTTP(S) protocols at ingestion.
 */
export function normalizePost(post: IPost): IPost {
  return {
    ...post,
    high_res_file: normalizePostFile(post.high_res_file),
    low_res_file: normalizePostFile(post.low_res_file),
    preview_file: normalizePostFile(post.preview_file)
  }
}

/**
 * Normalizes a full IPostPage received from network endpoints or repositories.
 */
export function normalizePostPage<T extends { data: IPost[] }>(page: T): T {
  return {
    ...page,
    data: page.data.map(normalizePost)
  }
}
