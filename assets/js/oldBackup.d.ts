export interface IOldBackupState {
  version: number
  user: IOldBackupUser
}

export interface IOldBackupUser {
  custom: IOldBackupCustom
}

export interface IOldBackupCustom {
  boorus: any[]
  tagCollections: IOldBackupTagCollection[]
  savedPosts: IOldBackupSavedPost[]
}

export interface IOldBackupTagCollection {
  name: string
  tags: string[]
}

export interface IOldBackupSavedPost {
  /** Booru + The ID of the post, e.g rule34.xxx-1234 */
  id: string
  data: IOldBackupData
  meta_data: IOldBackupMetaData
}

export interface IOldBackupData {
  id: number
  score: number
  high_res_file: IOldBackupHighResFile
  low_res_file: IOldBackupLowResFile
  preview_file: IOldBackupPreviewFile
  tags: IOldBackupTags
  sources: string[]
  rating: string
  media_type: string
}

export interface IOldBackupHighResFile {
  url: string
  width: number
  height: number
}

export interface IOldBackupLowResFile {
  url?: string
  width: number
  height: number
}

export interface IOldBackupPreviewFile {
  url: string
  width?: number
  height?: number
}

export interface IOldBackupTags {
  character: string[]
  copyright: string[]
  artist: string[]
  general: string[]
  meta: string[]
}

export interface IOldBackupMetaData {
  booru_domain: string
  created_at: string
}
