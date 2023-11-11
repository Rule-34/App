export interface IPostPage {
  data: IPost[]
  meta: IPostPageMeta
  links: IPostPageLinks
}

export interface IPost {
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
