export interface VuexUser {
  user: {
    custom: Custom
    settings: Settings
  }
}

interface Custom {
  boorus: Booru[]
  tagCollections: TagCollection[]
  savedPosts: SavedPost[]
}

interface Booru {
  domain: string
  type: string
  nsfw: boolean
  config: Record<string, unknown>
}

interface TagCollection {
  name: string
  tags: string[]
}

interface SavedPost {
  id: string
  data: Data
  meta_data: MetaData
}

interface Data {
  id: number
  score: number | null
  high_res_file: HighResFile
  low_res_file: LowResFile
  preview_file: PreviewFile
  tags: Tags
  rating: string
  media_type: string
  sources: string[]
}

interface HighResFile {
  url: string
  width: number
  height: number
}

interface LowResFile {
  url: string
  width: number
  height: number
}

interface PreviewFile {
  url: string
  width: number
  height: number
}

interface Tags {
  character: string[]
  copyright: string[]
  artist: string[]
  general: string[]
  meta: string[]
}

interface MetaData {
  booru_domain: string
  created_at: string
}

interface Settings {
  touchGestures: TouchGestures
  fullSizeImages: FullSizeImages
  postsPerPage: PostsPerPage
  score: Score
}

interface TouchGestures {
  value: boolean
}

interface FullSizeImages {
  value: boolean
}

interface PostsPerPage {
  value: number
}

interface Score {
  value: number
}
